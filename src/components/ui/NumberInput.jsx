import React from 'react';
import { Input } from './input';
import { Label } from './label';

/**
 * An Input component specialized for numeric values.
 * It prevents non-numeric characters from being entered.
 * @param {object} props - The component props.
 * @param {string} props.id - The id for the input and label.
 * @param {string} props.label - The text for the label.
 * @param {string|number} props.value - The current value of the input.
 * @param {function} props.onChange - The function to call when the value changes.
 * @param {string} [props.unit] - An optional unit to display next to the input.
 * @param {object} [props.inputProps] - Additional props to pass to the underlying Input component.
 */
const NumberInput = ({ id, label, value, onChange, unit, ...inputProps }) => {

    const handleChange = (e) => {
        const val = e.target.value;
        // Allow only numbers and a single decimal point
        if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
            onChange(val);
        }
    };

    return (
        <div>
            <Label htmlFor={id}>{label}</Label>
            <div className="flex items-center space-x-2 mt-1">
                <Input
                    id={id}
                    type="text" // Use text to allow for intermediate states like "1."
                    inputMode="decimal" // Hint for mobile keyboards
                    value={value}
                    onChange={handleChange}
                    {...inputProps}
                />
                {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
        </div>
    );
};

export default NumberInput;
