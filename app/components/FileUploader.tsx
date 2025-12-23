
import {useDropzone} from 'react-dropzone'
import {useState,useCallback} from 'react'

const FileUploader = () => {
const [file,setFile] = useState();

    const onDrop = useCallback(acceptedFiles => {
        // Do something with the files
    }, [])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    return (
        <div className="w-full gradient-border">
            <div {...getRootProps()}>
                <input {...getInputProps()} />

                <div className="space-y-4 cursor-pointer">
                    <div className="mx-auto w-16 h-16 flex items-centre justify-centre">
                        <img src="/icons/info.svg" alt="upload" className="size-20"/>
                    </div>

                    {file?(
                        <div></div>
                    ):(
                        <div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FileUploader;