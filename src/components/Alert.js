import React from "react";
import Alert from "@cloudscape-design/components/alert";

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
