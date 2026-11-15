// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import NotFound from './not-found';
import FactoryNotFound from './factory/not-found';
import ErrorPage from './error';
vi.mock('next-intl', () => ({useTranslations: () => (key: string) => key}));
vi.mock('next/link', () => ({default: ({children, ...props}: any) => createElement('a', props, children)}));
afterEach(cleanup);
it('missing public resource offers safe recovery', () => {
 render(createElement(NotFound));
 expect(screen.getByRole('link').getAttribute('href')).toBe('/');
 expect(screen.getByRole('heading').textContent).toBe('notFound.pageNotFound');
});
it('missing seller resource returns to authenticated hub', () => {
 render(createElement(FactoryNotFound));
 expect(screen.getByRole('link').getAttribute('href')).toBe('/factory');
});
it('transient failure offers retry without leaking backend details', () => {
 const reset=vi.fn();
 render(createElement(ErrorPage,{error: new Error('SECRET_BACKEND_DETAIL'),reset}));
 fireEvent.click(screen.getByRole('button'));
 expect(reset).toHaveBeenCalledOnce();
 expect(screen.queryByText(/SECRET_BACKEND_DETAIL/)).toBeNull();
 expect(screen.queryByText('notFound.pageNotFound')).toBeNull();
});
