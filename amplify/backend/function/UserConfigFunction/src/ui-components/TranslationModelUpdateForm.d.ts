/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { TranslationModel } from "../models";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type TranslationModelUpdateFormInputValues = {
    name?: string;
};
export declare type TranslationModelUpdateFormValidationValues = {
    name?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type TranslationModelUpdateFormOverridesProps = {
    TranslationModelUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type TranslationModelUpdateFormProps = React.PropsWithChildren<{
    overrides?: TranslationModelUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    translationModel?: TranslationModel;
    onSubmit?: (fields: TranslationModelUpdateFormInputValues) => TranslationModelUpdateFormInputValues;
    onSuccess?: (fields: TranslationModelUpdateFormInputValues) => void;
    onError?: (fields: TranslationModelUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: TranslationModelUpdateFormInputValues) => TranslationModelUpdateFormInputValues;
    onValidate?: TranslationModelUpdateFormValidationValues;
} & React.CSSProperties>;
export default function TranslationModelUpdateForm(props: TranslationModelUpdateFormProps): React.ReactElement;
