function authorize(...allowedRoles){
    return (req, res, next) => {
        if(!req.user){
            return res.status(401).json({error: "Authentication required."})
        }
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({error: `${req.user.role} doesn't have permission to access this page.`, requiredRoles: allowedRoles})
        }
        next();
    }
}

function isAdmin(res, req, next){
    if(req.user.role!=='admin'){
        return res.status(403).json({error: "Admin access required."})
    }
    next()
}

module.exports = {authorize, isAdmin}