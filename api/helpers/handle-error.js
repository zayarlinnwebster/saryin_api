module.exports = {

    friendlyName: 'Handle error',  // Descriptive name for the helper

    description: 'Handles errors by logging them and returning a standardized error response.',  // Description of what the helper does

    inputs: {
        error: {  // Input to accept the error object
            type: 'ref',  // Type ref allows passing objects like Error
            required: true,
        },

        customMessage: {  // Optional custom message to pass along with the error
            type: 'string',
            required: false,
            defaultsTo: '',  // Default to an empty string if not provided
        },

        statusCode: {  // Optional HTTP status code to use for the error response
            type: 'number',
            required: false,
            defaultsTo: 500,  // Default to 500 for Internal Server Error
        },
    },

    exits: {
        success: {
            description: 'Error handled and returned with response.',  // Description of the successful exit
        },
    },

    fn: async function ({ error, customMessage, statusCode }, exits) {
        // Log the error for debugging and future reference
        console.error('Error:', error);

        // Prepare a standardized error message
        const errorMessage = customMessage || 'An unexpected error occurred. Please try again later.';
        const response = {
            status: 'error',
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,  // Include error details only in development
        };

        // Send the error response with the provided or default status code
        return exits.success({
            statusCode,
            response,
        });
    }

};
