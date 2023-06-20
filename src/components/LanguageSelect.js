import React from 'react';
import Select from "@cloudscape-design/components/select";

const LanguageSelect = ({ languages, onChange }) => {
    const options = languages.map(language => ({
        label: language.name,
        value: language.code,
    }));

    const [selectedOption, setSelectedOption] = React.useState(options[0] || null);

    const handleChange = ({ detail }) => {
        setSelectedOption(detail.selectedOption);
        onChange(detail.selectedOption);
    };

    return (
        <Select selectedOption={selectedOption} placeholder="Language" onChange={handleChange} options={options} />
    );
};

export default LanguageSelect;
