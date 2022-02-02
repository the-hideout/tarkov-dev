import React from 'react';
import { render } from '../test-utils';
import App from '../App';
import { QueryClient, QueryClientProvider } from 'react-query';

import { useInView } from 'react-intersection-observer';
jest.mock('react-intersection-observer');

const queryClient = new QueryClient();

it('renders without crashing', () => {
    useInView.mockImplementation(() => [null, true]);

    render(
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>,
    );
});
