/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type TranslationConfigCreateFormInputValues = {
    url?: string;
};
export declare type TranslationConfigCreateFormValidationValues = {
    url?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type TranslationConfigCreateFormOverridesProps = {
    TranslationConfigCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    url?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type TranslationConfigCreateFormProps = React.PropsWithChildren<{
    overrides?: TranslationConfigCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: TranslationConfigCreateFormInputValues) => TranslationConfigCreateFormInputValues;
    onSuccess?: (fields: TranslationConfigCreateFormInputValues) => void;
    onError?: (fields: TranslationConfigCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: TranslationConfigCreateFormInputValues) => TranslationConfigCreateFormInputValues;
    onValidate?: TranslationConfigCreateFormValidationValues;
} & React.CSSProperties>;
export default function TranslationConfigCreateForm(props: TranslationConfigCreateFormProps): React.ReactElement;
