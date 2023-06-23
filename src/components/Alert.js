import React from "react";
import Alert from "@cloudscape-design/components/alert";

// This component is used to display an alert message so the user can see a message
export default function AlertComponent({ isVisible, handleDismiss, header, content }) {
    return (
        isVisible && (
            <Alert
                dismissAriaLabel="dismissAriaLabel"
                dismissible
                onDismiss={handleDismiss}
                statusIconAriaLabel="Warning"
                type="warning"
                header={ header }
            >
                {content}
            </Alert>
        )
    );
}
