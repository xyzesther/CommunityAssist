import { render, screen } from '@testing-library/react';
import NotFound from '../components/NotFound';

describe('NotFound Component', () => {
  test('displays the correct text', () => {
    render(<NotFound />);
    expect(screen.getByText('404 - Not Found')).toBeInTheDocument();
    expect(screen.getByText('The page you are looking for does not exist.')).toBeInTheDocument();
  });
});
