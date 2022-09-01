import React from "react";
import EngineService from "../service/engine.service";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

const FormLayoutDemo = () => {
    const toast = React.useRef(null);
    const [number, setNumber] = React.useState(0);
    const [message, setMessage] = React.useState("");

    React.useEffect(() => {
        EngineService.getNumber().then((res) => {
            if (res.data.isNotForm) {
                toast.current.show({ severity: "error", summary: "Error", detail: "Form is not entered", life: 3000 });
                return;
            }
            if (res.data.form) {
                setNumber(res.data.form.number);
            } else {
                toast.current.show({ severity: "error", summary: "Error", detail: "Engine Not Started", life: 3000 });
            }
        });
    }, []);

    const aprrove = (isNotAprroved) => {
        EngineService.approval(isNotAprroved, message)
            .then((res) => {
                if (res.data.isNotAprroved) {
                    toast.current.show({ severity: "error", summary: "Error", detail: "Not Aprroved", life: 3000 });
                } else {
                    if (res.data.isNotForm) {
                        toast.current.show({ severity: "error", summary: "Error", detail: "Form is not entered", life: 3000 });
                        return;
                    }
                    if (res.data.started !== undefined) {
                        toast.current.show({ severity: "error", summary: "Error", detail: "Engine is not started", life: 3000 });
                        return;
                    }
                    toast.current.show({ severity: "success", summary: "Success", detail: "Aprroved", life: 3000 });
                    EngineService.isFinished().then((result) => {
                        console.log(result.data);
                        if (result.data.isFinished) {
                            toast.current.show({ severity: "success", summary: "Success", detail: "Finished", life: 3000 });
                        }
                    });
                }
            })
            .catch((err) => {
                toast.current.show({ severity: "error", summary: "Error", detail: "Error", life: 3000 });
                console.log(err);
            });
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <h5>Start Engine</h5>
                    <h6>Number : {number}</h6>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12">
                            <label htmlFor="message">Message</label>
                            <InputText id="message" onChange={(e) => setMessage(e.target.value)} type="text" value={message} />
                        </div>
                        <div className="field col-2">
                            <Button className="p-button-success" onClick={() => aprrove(false)}>
                                Approve
                            </Button>
                        </div>
                        <div className="field col-2">
                            <Button className="p-button-danger mx-3" onClick={() => aprrove(true)}>
                                Not Aprrove
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const comparisonFn = function (prevProps, nextProps) {
    return prevProps.location.pathname === nextProps.location.pathname;
};

export default React.memo(FormLayoutDemo, comparisonFn);
