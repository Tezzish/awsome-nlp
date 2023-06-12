import React from 'react';
import Input from "@cloudscape-design/components/input";

const URLInput = ({ onChange }) => {
    const [value, setValue] = React.useState("");

    const handleChange = ({ detail }) => {
        setValue(detail.value);
        onChange(detail.value);
    };

    return (
        <Input onChange={handleChange} placeholder="AWS Blog URL" value={value} />
    );
};

export default URLInput;
