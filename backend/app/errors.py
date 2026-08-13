from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
def error(status:int,code:str,message:str,action:str): return {'error':{'code':code,'message':message,'action':action}}
async def validation_handler(_:Request,exc:RequestValidationError): return JSONResponse(content=error(422,'VALIDATION_ERROR','Some report details are invalid.','Review the highlighted fields and try again.'),status_code=422)
async def http_handler(_:Request,exc): return JSONResponse(content=error(exc.status_code,'REQUEST_FAILED',str(exc.detail),'Check your access or try again.'),status_code=exc.status_code)
