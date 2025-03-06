import * as DbServices from '../../DB/dbServices.js'


export const paginate = async ({ page, size, model, populate = [], select = "", filter = {}, sort = { createdAt: -1 } } = {}) => {
    page = parseInt(page < 1 ? process.env.PAGE : page)
    size = parseInt(size < 1 ? process.env.SIZE : size)
    const skip = (page - 1) * size //1-1=0*5=0 >>first time don't skip any thing,second will skip 5 and so on..
    const count = await model.find(filter).countDocuments()
    const data = await DbServices.find({
        model,
        filter,
        select,
        populate,
        skip,
        limit: size,
        sort
    }
    )

    return { page, size, data, count }

}