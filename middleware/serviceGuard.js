const serviceGuard = (req,res,next)=>{

  if(!req.user){
    return res.status(401).json({
      success:false,
      message:"Not authorized"
    })
  }

  if(req.user.account_status === "suspended"){
    return res.status(403).json({
      success:false,
      code:"ACCOUNT_SUSPENDED",
      message:req.user.status_reason || "Your account is suspended. Contact support."
    })
  }

  if(req.user.account_status === "locked"){
    return res.status(403).json({
      success:false,
      code:"ACCOUNT_LOCKED",
      message:req.user.status_reason || "Your account is locked. Contact support."
    })
  }

  const isApproved = req.user.approved_status === "approved"

  console.log(
    "approved:", isApproved,
    "id_verified:", req.user.id_verified,
    "license_verified:", req.user.license_verified
  )

  if(!isApproved || req.user.id_verified !== true || req.user.license_verified !== true){
    return res.status(403).json({
      success:false,
      code:"NOT_VERIFIED",
      message:"Your account is not verified/approved yet. Please wait for admin approval."
    })
  }

  next()
}
  
  module.exports = { serviceGuard }