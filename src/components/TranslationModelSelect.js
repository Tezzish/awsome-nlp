import React from 'react';
import Select from "@cloudscape-design/components/select";

const TranslationModelSelect = ({ translationModels, onChange }) => {
    const options = translationModels.map(model => ({
        label: model.name,
        value: model.id,
    }));

    const [selectedOption, setSelectedOption] = React.useState(options[0] || null);

    const handleChange = ({ detail }) => {
        setSelectedOption(detail.selectedOption);
        onChange(detail.selectedOption);
    };

    return (
        <Select selectedOption={selectedOption} placeholder="Translation Model" onChange={handleChange} options={options} />
    );
};

export default TranslationModelSelect;
