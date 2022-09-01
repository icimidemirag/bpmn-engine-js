import React from 'react';
import EngineService from "../service/engine.service"
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';

const FormLayoutDemo = () => {

    const toast = React.useRef(null);

    const [value, setValue] = React.useState(0);

    React.useEffect(()=>{
        EngineService.isFinished().then(res=>{
            console.log(res.data);
            if(res.data.message){
                toast.current.show({ severity: "error", summary: "Error", detail: res.data.message, life: 3000 });
            }

        })
    },[])

    React.useEffect(()=>{
        EngineService.getNumber().then(res=>{
            if(res.data.isNotForm){
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Form is not entered', life: 3000 });
                return;
            }
            if(res.data.form){
                setValue(res.data.form.number);
            }else{
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Engine Not Started', life: 3000 });
            }
        })
    },[])

    const sendNumber = () => {
        EngineService.sendNumber(value).then(res=>{
            console.log(res)
            if(res.data.number !== undefined){
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Number Sent', life: 3000 });
            }
            else{
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Engine Not Started', life: 3000 });
            }
        })
        .catch(err=>{
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Number Not Sent', life: 3000 });
            console.log(err)
        })
    }

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <h5>Send Number</h5>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12">
                            <label htmlFor="number">Number</label>
                            <InputNumber value={value} onValueChange={(e) => setValue(e.value)} mode="decimal" locale="en-US" minFractionDigits={2}/>
                        </div>
                        <div className="field col-2">
                            <Button onClick={sendNumber}>Send</Button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

const comparisonFn = function (prevProps, nextProps) {
    return prevProps.location.pathname === nextProps.location.pathname;
};

export default React.memo(FormLayoutDemo, comparisonFn);
