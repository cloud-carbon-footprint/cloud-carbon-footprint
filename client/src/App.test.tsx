import React from "react";
import { render } from "@testing-library/react";
import App from "./App";

jest.mock("react-apexcharts", () => jest.fn(() => { return null; }) );

test("renders the page title", () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/AWS Emissions and Wattage and Cost/i);
  expect(linkElement).toBeInTheDocument();
});
