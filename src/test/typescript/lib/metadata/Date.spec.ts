import { expect } from "chai"
import "mocha"
import {
    Dates,
    QualifiedDate,
    qualifiedDateDeconverter,
    qualifiedDatesConverter, qualifiedDateStringDeconverter,
} from "../../../../main/typescript/lib/metadata/Date"
import { DropdownListEntry } from "../../../../main/typescript/model/DropdownLists"

describe("Date", () => {

    const dateChoices: DropdownListEntry[] = [
        {
            key: "dcterms:date",
            value: "Date",
            displayValue: "Date",
        },
        {
            key: "dcterms:valid",
            value: "Valid",
            displayValue: "Valid",
        },
        {
            key: "dcterms:issued",
            value: "Issued",
            displayValue: "Issued",
        },
        {
            key: "dcterms:modified",
            value: "Modified",
            displayValue: "Modified",
        },
        {
            key: "dcterms:dateAccepted",
            value: "Date accepted",
            displayValue: "Date accepted",
        },
        {
            key: "dcterms:dateCopyrighted",
            value: "Date copyrighted",
            displayValue: "Date copyrighted",
        },
    ]

    const converter = qualifiedDatesConverter(dateChoices)

    describe("qualifiedDatesConverter", () => {

        it("should convert a valid sequence of dates and split them correctly", () => {
            const input = [
                {
                    scheme: "dcterms:W3CDTF",
                    value: "2018-03-18",
                    qualifier: "dcterms:dateCopyrighted",
                },
                {
                    scheme: "dcterms:W3CDTF",
                    value: "2018-03-17",
                    qualifier: "dcterms:valid",
                },
                {
                    scheme: "dcterms:W3CDTF",
                    value: "2018-03-19",
                    qualifier: "dcterms:created",
                },
                {
                    value: "2018-02-02",
                    qualifier: "dcterms:modified",
                },
                {
                    scheme: "dcterms:W3CDTF",
                    value: "2018-03-14",
                    qualifier: "dcterms:available",
                },
                {
                    value: "Groundhog day",
                    qualifier: "dcterms:issued",
                },
            ]
            const expected: Dates = {
                dateCreated: {
                    qualifier: "dcterms:created",
                    value: new Date("2018-03-19"),
                },
                dateAvailable: {
                    qualifier: "dcterms:available",
                    value: new Date("2018-03-14"),
                },
                dates: [
                    {
                        qualifier: "dcterms:dateCopyrighted",
                        value: new Date("2018-03-18"),
                    },
                    {
                        qualifier: "dcterms:valid",
                        value: new Date("2018-03-17"),
                    },
                ],
                textDates: [
                    {
                        qualifier: "dcterms:modified",
                        value: "2018-02-02",
                    },
                    {
                        qualifier: "dcterms:issued",
                        value: "Groundhog day",
                    },
                ],
            }
            expect(converter(input)).to.deep.equal(expected)
        })

        it("should fail when no qualifier is given", () => {
            const input = [
                {
                    scheme: "dcterms:W3CDTF",
                    value: "2018-03-18",
                    // no qualifier
                },
            ]
            expect(() => converter(input)).to
                .throw("Error in metadata: no such date qualifier: 'undefined'")
        })

        it("should fail when an invalid qualifier is given", () => {
            const input = [
                {
                    scheme: "dcterms:W3CDTF",
                    value: "2018-03-18",
                    qualifier: "dcterms:dateInvalid"
                },
            ]
            expect(() => converter(input)).to
                .throw("Error in metadata: no such date qualifier: 'dcterms:dateInvalid'")
        })

        it("should fail when multiple dateCreated fields are given", () => {
            const input = [
                {
                    scheme: "dcterms:W3CDTF",
                    value: "2018-03-18",
                    qualifier: "dcterms:created"
                },
                {
                    scheme: "dcterms:W3CDTF",
                    value: "2018-03-19",
                    qualifier: "dcterms:created"
                },
            ]
            expect(() => converter(input)).to
                .throw("Error in metadata: multiple dates with qualifier 'created' found")
        })

        it("should fail when multiple dateAvailable fields are given", () => {
            const input = [
                {
                    scheme: "dcterms:W3CDTF",
                    value: "2018-03-18",
                    qualifier: "dcterms:available"
                },
                {
                    scheme: "dcterms:W3CDTF",
                    value: "2018-03-19",
                    qualifier: "dcterms:available"
                },
            ]
            expect(() => converter(input)).to
                .throw("Error in metadata: multiple dates with qualifier 'available' found")
        })

        it("should fail when multiple dateSubmitted fields are given", () => {
            const input = [
                {
                    scheme: "dcterms:W3CDTF",
                    value: "2018-03-18",
                    qualifier: "dcterms:dateSubmitted"
                },
                {
                    scheme: "dcterms:W3CDTF",
                    value: "2018-03-19",
                    qualifier: "dcterms:dateSubmitted"
                },
            ]
            expect(() => converter(input)).to
                .throw("Error in metadata: multiple dates with qualifier 'dateSubmitted' found")
        })

        it("should fail when the date is not properly formatted", () => {
            const input = [
                {
                    scheme: "dcterms:W3CDTF",
                    value: "20180318",
                    qualifier: "dcterms:dateSubmitted"
                },
            ]
            expect(() => converter(input)).to
                .throw("Error in metadata: invalid date found: '20180318'")
        })
    })

    describe("qualifiedDateDeconverter", () => {

        it("should convert a QualifiedDate into the correct external model", () => {
            const input: QualifiedDate<Date> = {
                qualifier: "dcterms:issued",
                value: new Date("2018-03-14")
            }
            const expected = {
                scheme: "dcterms:W3CDTF",
                value: "2018-03-14T01:00:00+0100",
                qualifier: "dcterms:issued",
            }
            expect(qualifiedDateDeconverter(input)).to.deep.equal(expected)
        })

        it("should convert a QualifiedDate without a value into an empty object", () => {
            const input: QualifiedDate<Date> = {
                qualifier: "dcterms:issued",
            }
            const expected = {}
            expect(qualifiedDateDeconverter(input)).to.deep.equal(expected)
        })
    })

    describe("qualifiedDateStringDeconverter", () => {

        it("should convert a QualifiedDate with string value into the correct external model", () => {
            const input: QualifiedDate<string> = {
                qualifier: "dcterms:issued",
                value: "today",
            }
            const expected = {
                value: "today",
                qualifier: "dcterms:issued",
            }
            expect(qualifiedDateStringDeconverter(input)).to.deep.equal(expected)
        })
    })
})
