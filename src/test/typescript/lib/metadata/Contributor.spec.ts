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
import { expect } from "chai"
import { describe, it } from "mocha"
import {
    Contributor,
    contributorConverter,
    contributorDeconverter,
    contributorsConverter,
    rightsHolderDeconverter,
} from "../../../../main/typescript/lib/metadata/Contributor"
import { DropdownListEntry } from "../../../../main/typescript/model/DropdownLists"

describe("Contributor", () => {

    const idChoices: DropdownListEntry[] = [
        {
            key: "id-type:DAI",
            value: "DAI",
            displayValue: "DAI",
        },
        {
            key: "id-type:ISNI",
            value: "ISNI",
            displayValue: "ISNI",
        },
    ]

    const roleChoices: DropdownListEntry[] = [
        {
            key: "DataCurator",
            value: "Data curator",
            displayValue: "Data curator",
        },
        {
            key: "Researcher",
            value: "Researcher",
            displayValue: "Researcher",
        },
        {
            key: "RightsHolder",
            value: "Rightsholder",
            displayValue: "Rightsholder",
        },
    ]

    describe("contributorConverter", () => {

        it("should convert a valid contributor", () => {
            const input = {
                titles: "Drs.",
                initials: "D.A.",
                insertions: "",
                surname: "NS",
                ids: [
                    {
                        scheme: "id-type:DAI",
                        value: "123456",
                    },
                    {
                        scheme: "id-type:ISNI",
                        value: "abcdef",
                    },
                ],
                role: {
                    scheme: "datacite:contributorType",
                    key: "DataCurator",
                    value: "Data curator",
                },
                organization: "KNAW",
            }
            const expected: Contributor = {
                titles: "Drs.",
                initials: "D.A.",
                insertions: "",
                surname: "NS",
                ids: [
                    {
                        scheme: "id-type:DAI",
                        value: "123456",
                    },
                    {
                        scheme: "id-type:ISNI",
                        value: "abcdef",
                    },
                ],
                role: "DataCurator",
                organization: "KNAW",
            }
            expect(contributorConverter(idChoices, roleChoices)(input)).to.eql(expected)
        })

        it("should convert an empty input to an internal representation with empty strings", () => {
            const input = {}
            const expected: Contributor = {
                titles: "",
                initials: "",
                insertions: "",
                surname: "",
                ids: [{ scheme: "", value: "" }],
                role: "",
                organization: "",
            }
            expect(contributorConverter(idChoices, roleChoices)(input)).to.eql(expected)
        })

        it("should convert a partial contributor", () => {
            const input = {
                ids: [
                    {
                        // no scheme
                        value: "123456",
                    },
                    {
                        scheme: "id-type:ISNI",
                        // no value
                    },
                ],
            }
            const expected: Contributor = {
                titles: "",
                initials: "",
                insertions: "",
                surname: "",
                ids: [
                    {
                        scheme: undefined,
                        value: "123456",
                    },
                    {
                        scheme: "id-type:ISNI",
                        value: undefined,
                    },
                ],
                role: "",
                organization: "",
            }
            expect(contributorConverter(idChoices, roleChoices)(input)).to.eql(expected)
        })

        it("should fail when using an invalid contributor scheme id", () => {
            const input = {
                ids: [
                    {
                        scheme: "id-type:invalid",
                        value: "123456",
                    },
                ],
            }
            expect(() => contributorConverter(idChoices, roleChoices)(input)).to
                .throw("Error in metadata: no such creator/contributor id scheme: 'id-type:invalid'")
        })

        it("should fail when using an invalid contributor role scheme", () => {
            const input = {
                role: {
                    scheme: "datacite:invalid",
                    key: "Researcher",
                    value: "Researcher",
                },
            }
            expect(() => contributorConverter(idChoices, roleChoices)(input)).to
                .throw("Error in metadata: no such creator/contributor role scheme: 'datacite:invalid'")
        })

        it("should fail when using an invalid contributor role", () => {
            const input = {
                role: {
                    scheme: "datacite:contributorType",
                    key: "invalid",
                    value: "invalid",
                },
            }
            expect(() => contributorConverter(idChoices, roleChoices)(input)).to
                .throw("Error in metadata: no such creator/contributor role: 'invalid'")
        })
    })

    describe("contributorsConverter", () => {

        it("should convert and partition valid contributors", () => {
            const input1 = {
                titles: "Drs.",
                initials: "D.A.",
                insertions: "",
                surname: "NS",
                ids: [
                    {
                        scheme: "id-type:DAI",
                        value: "123456",
                    },
                    {
                        scheme: "id-type:ISNI",
                        value: "abcdef",
                    },
                ],
                role: {
                    scheme: "datacite:contributorType",
                    key: "Researcher",
                    value: "Researcher",
                },
                organization: "KNAW",
            }
            const input2 = {
                organization: "rightsHolder1",
                role: {
                    scheme: "datacite:contributorType",
                    key: "RightsHolder",
                    value: "rightsholder",
                },
            }
            const expected1: Contributor = {
                titles: "Drs.",
                initials: "D.A.",
                insertions: "",
                surname: "NS",
                ids: [
                    {
                        scheme: "id-type:DAI",
                        value: "123456",
                    },
                    {
                        scheme: "id-type:ISNI",
                        value: "abcdef",
                    },
                ],
                role: "Researcher",
                organization: "KNAW",
            }
            const expected2: Contributor = {
                titles: "",
                initials: "",
                insertions: "",
                surname: "",
                ids: [{ scheme: "", value: "" }],
                role: "RightsHolder",
                organization: "rightsHolder1",
            }
            expect(contributorsConverter(idChoices, roleChoices)([input1, input2])).to.eql([[expected2], [expected1]])
        })
    })

    describe("contributorDeconverter", () => {

        it("should convert an empty Contributor to an empty object", () => {
            const input: Contributor = {
                titles: "",
                initials: "",
                insertions: "",
                surname: "",
                ids: [{ scheme: "", value: "" }],
                role: "",
                organization: "",
            }
            const expected = {}
            expect(contributorDeconverter(roleChoices)(input)).to.eql(expected)
        })

        it("should convert a Contributor into the correct external model", () => {
            const input: Contributor = {
                titles: "Drs.",
                initials: "D.A.",
                insertions: "van",
                surname: "NS",
                ids: [
                    {
                        scheme: "id-type:DAI",
                        value: "123456",
                    },
                    {
                        scheme: "id-type:ISNI",
                        value: "abcdef",
                    },
                ],
                role: "DataCurator",
                organization: "KNAW",
            }
            const expected = {
                titles: "Drs.",
                initials: "D.A.",
                insertions: "van",
                surname: "NS",
                ids: [
                    {
                        scheme: "id-type:DAI",
                        value: "123456",
                    },
                    {
                        scheme: "id-type:ISNI",
                        value: "abcdef",
                    },
                ],
                role: {
                    scheme: "datacite:contributorType",
                    key: "DataCurator",
                    value: "Data curator",
                },
                organization: "KNAW",
            }
            expect(contributorDeconverter(roleChoices)(input)).to.eql(expected)
        })

        it("should fail when an invalid role is used", () => {
            const input: Contributor = {
                role: "invalid",
            }
            expect(() => contributorDeconverter(roleChoices)(input)).to
                .throw("Error in metadata: no valid role found for key 'invalid'")
        })
    })

    describe("rightsHolderDeconverter", () => {

        it("should convert an empty Contributor to an empty object", () => {
            const input: Contributor = {
                titles: "",
                initials: "",
                insertions: "",
                surname: "",
                ids: [{ scheme: "", value: "" }],
                role: "",
                organization: "",
            }
            const expected = {}
            expect(rightsHolderDeconverter(input)).to.eql(expected)
        })

        it("should convert a Contributor into the correct external model", () => {
            const input: Contributor = {
                titles: "Drs.",
                initials: "D.A.",
                insertions: "van",
                surname: "NS",
                ids: [
                    {
                        scheme: "id-type:DAI",
                        value: "123456",
                    },
                    {
                        scheme: "id-type:ISNI",
                        value: "abcdef",
                    },
                ],
                role: "RightsHolder",
                organization: "KNAW",
            }
            const expected = {
                titles: "Drs.",
                initials: "D.A.",
                insertions: "van",
                surname: "NS",
                ids: [
                    {
                        scheme: "id-type:DAI",
                        value: "123456",
                    },
                    {
                        scheme: "id-type:ISNI",
                        value: "abcdef",
                    },
                ],
                role: {
                    scheme: "datacite:contributorType",
                    key: "RightsHolder",
                    value: "Rightsholder",
                },
                organization: "KNAW",
            }
            expect(rightsHolderDeconverter(input)).to.eql(expected)
        })
    })
})
