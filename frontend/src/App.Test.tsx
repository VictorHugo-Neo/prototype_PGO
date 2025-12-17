import {render, screen} from '@testing-library/react';
import { describe, it, expect} from "vitest";
import App from "./App";

describe('App', () => {
    it('applies tailwind classes', () => {
        render(<App />);
        const heading = screen.getByText(/TESTE PGO FRONTEND/i);
        expect(heading).toHaveClass("text-3xl");
        expect(heading).toHaveClass("text-blue-600");
        expect(document.body).toBeDefined()
    });
});
