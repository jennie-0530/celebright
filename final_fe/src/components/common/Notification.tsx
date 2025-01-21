import React from "react";
import { Snackbar, Alert } from "@mui/material";

const Notification: React.FC<{
  open: boolean;
  message: string;
  severity: "success" | "error";
  onClose: () => void;
}> = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={onClose}>
      <Alert onClose={onClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
