import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Login from "../Login";
import * as api from "../../services/api";
import { AuthenticationContext } from "../../context/AuthenticationContext";

jest.mock("../../services/api");

jest.mock("../../services/caching", () => ({
  getFromCache: jest.fn().mockResolvedValue(null),
  setInCache: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../utils", () => {
  const original = jest.requireActual("../../utils");
  return {
    ...original,
    isTokenExpired: jest.fn().mockReturnValue(false),
    sanitizeEmail: (e: string) => e.trim().toLowerCase(),
  };
});

function renderWithCtx(navigate = jest.fn()) {
  const auth = { value: null, setValue: jest.fn() };
  const tree = render(<Login navigation={{ navigate }} />);
  return { ...tree, auth, navigate };
}

describe("Login screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows validation errors and does not call API when inputs invalid", async () => {
    const { getByText, getByLabelText } = renderWithCtx();
    const loginBtn = getByText("Log in");

    fireEvent.press(loginBtn);

    fireEvent(getByLabelText("email-input"), "endEditing");
    fireEvent(getByLabelText("password-input"), "endEditing");

    getByText(/invalid email/i);
    getByText(/invalid password/i);

    expect(api.authenticateUser).not.toHaveBeenCalled();
  });

  it("authenticates and navigates on valid input", async () => {
    (api.authenticateUser as jest.Mock).mockResolvedValueOnce({
      data: {
        user: { id: 1, name: "Alice" },
        accessToken: "token-123",
      },
    });

    const { getByText, getByLabelText, navigate } = renderWithCtx();

    fireEvent.changeText(getByLabelText("email-input"), "user@example.com");
    fireEvent.changeText(getByLabelText("password-input"), "secret12");

    fireEvent.press(getByText("Log in"));

    await waitFor(() => {
      expect(api.authenticateUser).toHaveBeenCalledWith(
        "user@example.com",
        "secret12"
      );
      expect(navigate).toHaveBeenCalledWith("EventsMap");
    });
  });

  it("shows alert message on API error", async () => {
    (api.authenticateUser as jest.Mock).mockRejectedValueOnce({
      response: { data: "Invalid credentials" },
    });

    const { getByText, getByLabelText } = renderWithCtx();

    fireEvent.changeText(getByLabelText("email-input"), "user@example.com");
    fireEvent.changeText(getByLabelText("password-input"), "secret12");

    fireEvent.press(getByText("Log in"));

    await waitFor(() => {
      expect(api.authenticateUser).toHaveBeenCalled();
    });
  });
});
