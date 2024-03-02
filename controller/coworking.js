const CoworkingSpace = require('../models/CoworkingSpace.js');

//@desc Get all coworkingspaces
//@route GET /api/v1/coworkingspaces
//@access Public
exports.getCoworkingSpaces=async(req,res,next)=>{
    let query;

    //Copy req.query
    const reqQuery ={...req.query};

    //Fields to exclude
    const removeFields=['select','sort','page','limit'];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string

    let queryStr=JSON.stringify(reqQuery);
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`)

    query =CoworkingSpace.find(JSON.parse(queryStr)).populate('reservations');

    //Select Fields
    if(req.query.select) {
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }

    //Sort
    if(req.query.sort){
        const sortBy=req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else{
        query =query.sort('-createdAt');
    }

    //Pagination
    const page=parseInt(req.query.page,10)||1;
    const limit=parseInt(req.query.limit,10)||25;
    const startIndex=(page-1)*limit;
    const endIndex=page*limit;
    const total=await CoworkingSpace.countDocuments();

    try{
        query=query.skip(startIndex).limit(limit);
        //Execute query
        const coworkingspaces = await query;

        //Pagination result
        const pagination={};

        if(endIndex<total) {
            pagination.next={
                page:page+1,
                limit
            }
        }
        
        if(startIndex>0){
            pagination.prev={
                page:page-1,
                limit
            }
        }
        res.status(200).json({success:true,count:coworkingspaces.length,data:coworkingspaces});
    }
    catch(err){
        res.status(400).json({success:false});
    }
    
};


//@desc Get single coworkingspace
//@route GET /api/v1/coworkingspaces/:id
//@access Public
exports.getCoworkingSpace= async(req,res,next)=>{
try{
    const coworkingspace = await CoworkingSpace.findById(req.params.id);

    if(!coworkingspace) {
        return res.status(400).json({success:false});
    }
    res.status(200).json({success:true,data:coworkingspace});
}
catch(err){
    res.status(400).json({success:false});
}

    
};


//@desc Create a coworkingspace
//@route POST /api/v1/coworkingspaces
//@access Private
exports.createCoworkingSpace=async(req,res,next)=>{
    const coworkingspace = await CoworkingSpace.create(req.body);
    res.status(201).json({success:true,data:coworkingspace});
}

//@desc Update a coworkingspace
//@route PUT /api/v1/coworkingspaces/:id
//@access Private
exports.updateCoworkingSpace=async(req,res,next)=>{
    try{
        const coworkingspace = await CoworkingSpace.findByIdAndUpdate(req.params.id, req.body ,{
            new: true,
            runValidators:true
        });
        if(!coworkingspace) {
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true,data: coworkingspace});
    }
    catch(err){
        res.status(400).json({success:false});
    }
    
};

//@desc delete a coworkingspace
//@route DELETE /api/v1/coworkingspaces/:id
//@access Private
exports.deleteCoworkingSpace = async(req,res,next)=>{
    try{
        const coworkingspace = await CoworkingSpace.findById(req.params.id);
        
        if(!coworkingspace) {
            return res.status(404).json({success:false ,message:`Bootcamp not found with id of ${req.params.id}`});
        }
 
        await coworkingspace.deleteOne();
        res.status(200).json({success:true,data: {}});
    }
    catch(err){
        res.status(400).json({success:false});
    }
    
};
