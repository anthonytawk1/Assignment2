import Joi from 'joi';

export const complaintValidation = {
  addComplaint: {
    body: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    categories:Joi.array().required()
  }),
},
changeComplaintStatus: {
  body: Joi.object({
    status: Joi.string().required()
  }),
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
}

};

export default complaintValidation;