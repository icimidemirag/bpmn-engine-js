import React from 'react';
import EngineService from "../service/engine.service"
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';

const FormLayoutDemo = () => {

    const toast = React.useRef(null);

    const startEngine = () => {
        EngineService.startEngine().then(res=>{
            console.log(res)
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Engine Started', life: 3000 });
        })
        .catch(err=>{
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Engine Not Started', life: 3000 });
            console.log(err)
        })
    }

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <h5>Start Engine</h5>
                    <Button onClick={startEngine}>Start Engine</Button>
                   
                </div>
            </div>
        </div>
    )
}

const comparisonFn = function (prevProps, nextProps) {
    return prevProps.location.pathname === nextProps.location.pathname;
};

export default React.memo(FormLayoutDemo, comparisonFn);
