/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { TranslationConfig } from "../models";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type TranslationConfigUpdateFormInputValues = {
    url?: string;
};
export declare type TranslationConfigUpdateFormValidationValues = {
    url?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type TranslationConfigUpdateFormOverridesProps = {
    TranslationConfigUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    url?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type TranslationConfigUpdateFormProps = React.PropsWithChildren<{
    overrides?: TranslationConfigUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    translationConfig?: TranslationConfig;
    onSubmit?: (fields: TranslationConfigUpdateFormInputValues) => TranslationConfigUpdateFormInputValues;
    onSuccess?: (fields: TranslationConfigUpdateFormInputValues) => void;
    onError?: (fields: TranslationConfigUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: TranslationConfigUpdateFormInputValues) => TranslationConfigUpdateFormInputValues;
    onValidate?: TranslationConfigUpdateFormValidationValues;
} & React.CSSProperties>;
export default function TranslationConfigUpdateForm(props: TranslationConfigUpdateFormProps): React.ReactElement;
