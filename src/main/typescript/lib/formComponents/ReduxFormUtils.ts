/*
 * Copyright (C) 2018 DANS - Data Archiving and Networked Services (info@dans.knaw.nl)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { FieldArray, GenericFieldArray, WrappedFieldArrayProps, WrappedFieldProps } from "redux-form"

export interface CustomFieldProps {
    mandatory?: boolean
}

export type FieldProps = WrappedFieldProps & CustomFieldProps

export interface CustomFieldArrayProps<FieldValue> extends CustomFieldProps {
    label?: string
    empty: FieldValue
    fieldNames: ((name: string) => string)[]
}

export type FieldArrayProps<FieldValue> = WrappedFieldArrayProps<FieldValue> & CustomFieldArrayProps<FieldValue>

export const RepeatableField = FieldArray as new <Data>() => GenericFieldArray<Data, CustomFieldArrayProps<Data>>
