import { ValidationError } from '@nestjs/common';
import { ValidationErrorConverterService } from './validation-error-converter.service';

// eslint-disable-next-line max-lines-per-function
describe('ValidationErrorConverterService', () => {
    it('should convert a single validation error list in a string well formatted', () => {
        const validationErrorList: ValidationError[] = [
            {
                value: [],
                property: 'triviaQuestionList',
                children: [],
                constraints: {
                    arrayNotEmpty: 'triviaQuestionList should not be empty',
                    arrayMinSize: 'triviaQuestionList must contain at least 6 elements',
                },
            },
        ];

        expect(ValidationErrorConverterService.convert(validationErrorList)).toEqual(
            '\n- triviaQuestionList should not be empty\n- triviaQuestionList must contain at least 6 elements'
        );
    });

    it('should convert a multiple validation error list in a string well formatted', () => {
        const validationErrorList: ValidationError[] = [
            {
                value: [],
                property: 'triviaQuestionList',
                children: [],
                constraints: {
                    arrayNotEmpty: 'triviaQuestionList should not be empty',
                    arrayMinSize: 'triviaQuestionList must contain at least 6 elements',
                },
            },
            {
                value: [],
                property: 'toto',
                children: [],
                constraints: {
                    arrayNotEmpty: 'toto should not be empty',
                    arrayMinSize: 'toto must contain at least 6 elements',
                },
            },
        ];

        expect(ValidationErrorConverterService.convert(validationErrorList)).toEqual(
            // eslint-disable-next-line max-len
            '\n- triviaQuestionList should not be empty\n- triviaQuestionList must contain at least 6 elements\n- toto should not be empty\n- toto must contain at least 6 elements'
        );
    });

    it('should convert children validation errors into a well-formatted string', () => {
        const validationErrorList: ValidationError[] = [
            {
                value: [],
                property: 'triviaQuestionList',
                children: [
                    {
                        property: 'tata',
                        constraints: {
                            arrayNotEmpty: 'tata should not be empty',
                            arrayMinSize: 'tata must contain at least 6 elements',
                        },
                    },
                    {
                        property: 'titi',
                        constraints: {
                            arrayNotEmpty: 'titi should not be empty',
                            arrayMinSize: 'titi must contain at least 6 elements',
                        },
                    },
                ],
            },
        ];

        expect(ValidationErrorConverterService.convert(validationErrorList)).toEqual(
            // eslint-disable-next-line max-len
            '\n- tata should not be empty\n- tata must contain at least 6 elements\n- titi should not be empty\n- titi must contain at least 6 elements'
        );
    });
});
