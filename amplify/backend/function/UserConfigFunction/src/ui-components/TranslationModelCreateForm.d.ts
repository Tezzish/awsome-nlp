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
export declare type TranslationModelCreateFormInputValues = {
    name?: string;
};
export declare type TranslationModelCreateFormValidationValues = {
    name?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type TranslationModelCreateFormOverridesProps = {
    TranslationModelCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type TranslationModelCreateFormProps = React.PropsWithChildren<{
    overrides?: TranslationModelCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: TranslationModelCreateFormInputValues) => TranslationModelCreateFormInputValues;
    onSuccess?: (fields: TranslationModelCreateFormInputValues) => void;
    onError?: (fields: TranslationModelCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: TranslationModelCreateFormInputValues) => TranslationModelCreateFormInputValues;
    onValidate?: TranslationModelCreateFormValidationValues;
} & React.CSSProperties>;
export default function TranslationModelCreateForm(props: TranslationModelCreateFormProps): React.ReactElement;
