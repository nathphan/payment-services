const friendRequestsModel = require('../models/friendRequests.js');

const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseUtils.js');
const { 
    validateGetRequestForUserById, 
    validateSendRequestForUserFields, 
    validateSendRequestForUser,
    validateAcceptRequestForUser } = require('../validators/friendRequestValidator.js');

// GET PENDING OUTGOING FRIEND REQUESTS
const getRequestsForUser = (req, res) => {
    const { userId } = req.params;

    // get all requests for this user
    friendRequestsModel.getRequestsForUser(userId)
        .then((results) => sendSuccessResponse(res, null, results, 200))
        .catch((err) => sendErrorResponse(res, err, null, 400));
}

const getRequestForUserById = (req, res) => {
    const { userId, requestId } = req.params;
    
    validateGetRequestForUserById(requestId, userId)
        .then((results) => {
            if (results === 0) sendErrorResponse(res, 'Request Does Not Exist...', null, 400);
            if (results === 1) sendErrorResponse(res, 'You do not have permission for this request', null, 400);
            if (results !== -1) return;

            // Get Request
            friendRequestsModel.getRequestForUserById(userId, requestId)
                .then((results) => sendSuccessResponse(res, null, results, 200))
                .catch((err) => sendErrorResponse(res, err, null, 400));
        })
        .catch((err) => sendErrorResponse(res, err, null, 400));
}

const sendRequestForUser = (req, res) => {
    const { userId } = req.params;
    const { body } = req;

    // Validate Fields
    if (!validateSendRequestForUserFields(body)) {
        sendErrorResponse(res, 'Recepient Required...', null, 400);
        return;
    }

    // Validate Request
    validateSendRequestForUser(userId, body.to_user)
        .then((results) => {
            // Already Friends
            if (results === 0) sendErrorResponse(res, 'You are already friends with this user...', null, 400);
            // Pending Request
            if (results === 1) sendErrorResponse(res, 'You are already have a pending request with this user...', null, 400);
            if (results !== -1) return;

            // Create Request
            const friendRequest = new friendRequestsModel({...body, from_user: userId});
            friendRequestsModel.sendRequestForUser(friendRequest)
                .then((results) => sendSuccessResponse(res, 'Friend Request Sent...', results, 200))
                .catch((err) => sendErrorResponse(res, err, null, 400));
        })
        .catch((err) => sendErrorResponse(res, err, null, 400));
}

const acceptRequestForUser = (req, res) => {
    const { userId, requestId } = req.params;

    // Validate Request
    validateAcceptRequestForUser(requestId, userId)
        .then((results) => {
            // Request Does Not Exist
            if (results === 0) sendErrorResponse(res, 'Request does not exist...', null, 400);
            // Request Already Accepted
            if (results === 1) sendErrorResponse(res, 'Request already accepted...', null, 400);
            // User Does Not Have Access to Request
            if (results === 2) sendErrorResponse(res, 'You do not have permission for this request...', null, 400);
            if (results !== -1) return;

            // Accept Request
            friendRequestsModel.acceptRequestForUser(parseInt(userId), parseInt(requestId))
                .then((results) => sendSuccessResponse(res, 'Friend Request Accepted...', results, 200))
                .catch((err) => sendErrorResponse(res, err, null, 400));            
        })
        .catch((err) => sendErrorResponse(res, err, null, 400));
}


module.exports = { getRequestsForUser, getRequestForUserById, sendRequestForUser, acceptRequestForUser }  