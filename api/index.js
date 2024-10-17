import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";

// this is a middleware that will validate the access token sent by the client
const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: "RS256",
});

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient, RequestStatus, AppointmentStatus } = pkg;
const prisma = new PrismaClient();

// this is a public endpoint because it doesn't have the requireAuth middleware
app.get("/ping", (req, res) => {
  res.send("pong");
});

// this endpoint is used by the client to verify the user status and to make sure the user is registered in our database once they signup with Auth0
// if not registered in our database we will create it.
// if the user is already registered we will return the user information
app.post("/verify-user", requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    // we are using the audience to get the email and name from the token
    // if your audience is different you should change the key to match your audience
    // the value should match your audience according to this document: https://docs.google.com/document/d/1lYmaGZAS51aeCxfPzCwZHIk6C5mmOJJ7yHBNPJuGimU/edit#heading=h.fr3s9fjui5yn
    const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
    const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`];

    let user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        auth0Id,
        name,
      },
    });
  }
  res.json(user);
} catch (error) {
  console.error("Error in /verify-user:", error);
  res.status(500).send("Internal Server Error");
}
});

// GET: return user information
app.get('/user', requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// PUT: update user information
app.put('/user', requireAuth, async (req, res) => {
  const { name, email } = req.body;
  const auth0Id = req.auth.payload.sub;

  try {
    const updatedUser = await prisma.user.update({
      where: { auth0Id },
      data: {
        name,
        email,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST: create a new request
app.post("/requests", requireAuth, async (req, res) => {
  const { title, description, status = RequestStatus.OPEN } = req.body;
  const auth0Id = req.auth.payload.sub;

  if (!title) {
    return res.status(400).send("The title is required");
  } else if (!description) {
    return res.status(400).send("The description is required");
  } 

  const user = await prisma.user.findUnique({ where: { auth0Id } });
  const newRequest = await prisma.request.create({
    data: { 
      title, 
      description, 
      status, 
      userId: user.id
    },
  });
  res.status(201).json(newRequest);

});

// Get: return all requests
app.get("/requests", async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      include: {
        user: true
      }
    });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get: return all requests by user
app.get("/requests/user", requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const user = await prisma.user.findUnique({
      where: { auth0Id },
    });
    const requests = await prisma.request.findMany({
      where: { userId: user.id },
    });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests by user:", error);
    res.status(500).send("Internal Server Error");
  }
});
     
// Get: return a request by id
app.get("/requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.request.findUnique({
      where: { requestId: parseInt(id) },
      include: {
          user: true
      }
    });
    res.json(request);
  } catch (error) {
    console.error("Error fetching the request by id:", error);
    res.status(500).send("Internal Server Error");
  }
});

// PUT: update a request by id
app.put("/requests/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const updatedRequest = await prisma.request.update({
      where: { requestId: parseInt(id) },
      data: { title, description, status },
    });

    if (status === 'COMPLETED') {
      await prisma.appointment.updateMany({
        where: { requestId: parseInt(id) },
        data: { status: AppointmentStatus.COMPLETED },
      });
    }
    res.json(updatedRequest);
  } catch (error) {
    console.error("Error updating the request:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete: delete a request by id
app.delete("/requests/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.request.delete({
      where: { requestId: parseInt(id) },
    });
    res.sendStatus(204);
  } catch (error) {
    if (error.code === 'P2003') { // Foreign key constraint error code
      res.status(400).send('Request with appointments cannot be deleted');
    } else {
      console.error('Error deleting request:', error);
      res.status(500).send('Internal Server Error');
    }
  }
});

// POST: create a new appointment
app.post("/appointments", requireAuth, async (req, res) => {
  const { requestId, appointmentTime, status = AppointmentStatus.SCHEDULED } = req.body;
  const auth0Id = req.auth.payload.sub;

  if (!appointmentTime) {
    return res.status(400).send("The appointment time is required");
  } else if (!requestId) {
    return res.status(400).send("The request is required");
  }

  const user = await prisma.user.findUnique({ where: { auth0Id } });
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      requestId: parseInt(requestId),
      status: { not: 'CANCELLED' }
    }
  });

  if (existingAppointments.length > 0) {
    return res.status(400).send("An appointment already exists for this request");
  }

  try {
    const newAppointment = await prisma.appointment.create({
      data: {
        requestId: parseInt(requestId),
        volunteerId: user.id,
        appointmentTime: new Date(appointmentTime),
        status,
      },
    });

    await prisma.request.update({
      where: { requestId: parseInt(requestId) },
      data: { status: RequestStatus.IN_PROGRESS },
    });

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get: return all appointments or filter by request
app.get("/appointments", async (req, res) => {
  try {
    const { requestId } = req.query;
    const where = requestId ? { requestId: parseInt(requestId) } : {};
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        request: true,
        volunteer: true,
      },
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get: return all appointments by user
app.get("/appointments/user", requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const user = await prisma.user.findUnique({
      where: { auth0Id },
    });
    const appointments = await prisma.appointment.findMany({
      where: { volunteerId: user.id },
      include: {
        request: {
          include: {
            user: true,
          },
        },
      },
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get: return an appointment by id
app.get("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { appointmentId: parseInt(id) },
      include: {
        request: true,
        volunteer: true,
      },
    });
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment by id:', error);
    res.status(500).send('Internal Server Error');
  }
});

// PUT: update an appointment by id
app.put("/appointments/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const existingAppointment = await prisma.appointment.findUnique({
      where: { appointmentId: parseInt(id) },
    });

    if (!existingAppointment) {
      return res.status(404).send('Appointment not found');
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { appointmentId: parseInt(id) },
      data: { appointmentTime: existingAppointment.appointmentTime, status },
    });

    if (status === 'CANCELLED') {
      const activeAppointments = await prisma.appointment.findMany({
        where: {
          requestId: existingAppointment.requestId,
          status: { not: 'CANCELLED' }
        }
      });

      if (activeAppointments.length === 0) {
        await prisma.request.update({
          where: { requestId: existingAppointment.requestId },
          data: { status: RequestStatus.OPEN },
        });
      }
    }
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Delete: delete an appointment by id
app.delete("/appointments/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.appointment.delete({
      where: { appointmentId: parseInt(id) },
    });
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
});
