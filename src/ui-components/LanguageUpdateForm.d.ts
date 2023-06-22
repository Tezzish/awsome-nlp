/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { Language } from "../models";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type LanguageUpdateFormInputValues = {
    name?: string;
    code?: string;
};
export declare type LanguageUpdateFormValidationValues = {
    name?: ValidationFunction<string>;
    code?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type LanguageUpdateFormOverridesProps = {
    LanguageUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
    code?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type LanguageUpdateFormProps = React.PropsWithChildren<{
    overrides?: LanguageUpdateFormOverridesProps | undefined | null;
} & {
    code?: string;
    language?: Language;
    onSubmit?: (fields: LanguageUpdateFormInputValues) => LanguageUpdateFormInputValues;
    onSuccess?: (fields: LanguageUpdateFormInputValues) => void;
    onError?: (fields: LanguageUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: LanguageUpdateFormInputValues) => LanguageUpdateFormInputValues;
    onValidate?: LanguageUpdateFormValidationValues;
} & React.CSSProperties>;
export default function LanguageUpdateForm(props: LanguageUpdateFormProps): React.ReactElement;
