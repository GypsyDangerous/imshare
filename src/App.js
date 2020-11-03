import "./App.scss";
import { useState, useMemo, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import BarLoader from "react-bar-loader";

function App() {
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const inputRef = useRef();

	const { getRootProps, getInputProps } = useDropzone({
		accept: "image/*",
		onDrop: useCallback(acceptedFiles => {
			(async () => {
				setError(null);
				setLoading(true);
				try {
					const body = new FormData();
					body.append("image", acceptedFiles[0]);

					const response = await fetch("http://localhost:1800/api/v1/upload", {
						method: "POST",
						body,
					});
					const clone = response.clone();
					if (!response.ok) {
						return setError("Please Try again, you may have invalid image.");
					}
					try {
						const json = await response.json();
					} catch (err) {
						setError("Please Try again, you may have invalid image.");
					}
				} catch (err) {
					setError(err.message);
				}
				setTimeout(() => {
					setLoading(false);
				}, 3000);
			})();

			acceptedFiles.forEach(file => {
				const reader = new FileReader();

				reader.onabort = () => console.log("file reading was aborted");
				reader.onerror = () => console.log("file reading has failed");
				reader.onload = () => {
					// Do whatever you want with the file contents
					const binaryStr = reader.result;
					console.log(binaryStr);
				};
				reader.readAsArrayBuffer(file);
			});
			setFiles(
				acceptedFiles.map(file =>
					Object.assign(file, { preview: URL.createObjectURL(file) })
				)
			);
		}, []),
	});

	const images = useMemo(() => {
		return files.map(file => (
			<div key={file.name}>
				<div>
					<img src={file.preview}  alt={`${file.name} preview`} />
				</div>
			</div>
		));
	}, [files]);

	const { ref: dragRef, ...inputProps } = getInputProps();

	return (
		<div className="App">
			<main>
				{error ? (
					<>
						<h1>Error: </h1>
						<p>{error}</p>
					</>
				) : !loading ? (
					<>
						<h1>Upload your image</h1>
						<h2>File should be Jpeg, Png,...</h2>
						<div className="drag-area" {...getRootProps()}>
							<input
								ref={node => {
									inputRef.current = node;
									dragRef.current = node;
								}}
								{...inputProps}
							/>
							{images.length ? (
								images[0]
							) : (
								<>
									<img src={`/preview.svg`} width="133" id="preview" alt="" />
									<p>{"Drag & Drop your image here"}</p>
								</>
							)}
						</div>
						<h3>Or</h3>
						<button onClick={() => inputRef.current.click()}>Choose a file</button>
					</>
				) : (
					<>
						<h1>Uploading...</h1>
						<BarLoader color="#1D8BF1" className="loader" height="10" />
					</>
				)}
			</main>
		</div>
	);
}

export default App;
