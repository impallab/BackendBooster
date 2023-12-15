class ApiErrors extends Error{
    constructor(
        stausCode,
        message="something went wrong",
        errors=[],
        statck=""
        ){
        super(message)
        this.stausCode=stausCode
        this.data=null
        this.message=message
        this.success=false;
        this.errors=errors


        if(statck){
            this.statck=statck
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}


export {ApiErrors}