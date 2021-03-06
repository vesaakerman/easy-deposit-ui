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
import { clean } from "./misc"
import { DropdownListEntry } from "../../model/DropdownLists"

export interface Point {
    scheme?: string
    x?: string
    y?: string
}

export const emptyPoint: Point = { scheme: "", x: undefined, y: undefined }

export const pointConverter: (schemeValues: DropdownListEntry[]) => (p: any) => Point = schemeValues => p => {
    const invalidInput = p.x && Number.isNaN(Number(p.x))
        || p.y && Number.isNaN(Number(p.y))

    if (invalidInput)
        throw `Error in metadata: Point ${JSON.stringify(p)} consists of something else than a Number`
    else if (p.scheme && !schemeValues.find(({ key }) => key === p.scheme))
        throw `Error in metadata: unknown coordinate system: '${p.scheme}'`
    else
        return {
            scheme: p.scheme,
            x: p.x,
            y: p.y,
        }
}

export const pointDeconverter: (p: Point) => any = p => clean({
    scheme: p.scheme,
    x: p.x && Number(p.x),
    y: p.y && Number(p.y),
})
