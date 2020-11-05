import "./App.scss";
import { useState, useMemo, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import BarLoader from "react-bar-loader";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const Check = () => {
	return (
		<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
			<circle
				className="path circle"
				fill="none"
				stroke="#73AF55"
				strokeWidth="8"
				strokeMiterlimit="10"
				cx="65.1"
				cy="65.1"
				r="62.1"
			/>
			<polyline
				className="path check"
				fill="none"
				stroke="#73AF55"
				strokeWidth="8"
				strokeLinecap="round"
				strokeMiterlimit="10"
				points="100.2,40.2 51.5,88.8 29.8,67.5 "
			/>
		</svg>
	);
};

function App() {
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [uploadedUrl, setUploadedUrl] = useState(null);
	const [copied, setCopied] = useState(false);
	const inputRef = useRef();

	const handleClose = (event, reason) => {
		if (reason === "clickaway") {
			return;
		}
		setCopied(false);
	};

	const reset = () => {
		setFiles([]);
		setLoading(false);
		setError(null);
		setUploadedUrl(null);
	};

	const { getRootProps, getInputProps } = useDropzone({
		accept: "image/*",
		onDrop: useCallback(acceptedFiles => {
			(async () => {
				setError(null);
				setLoading(true);
				let url;
				try {
					const body = new FormData();
					body.append("image", acceptedFiles[0]);

					const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/upload`, {
						method: "POST",
						body,
					});
					// const clone = response.clone();
					if (!response.ok) {
						return setError("Please Try again, you may have invalid image.");
					}
					try {
						const json = await response.json();
						url = `${process.env.REACT_APP_API_URL}/${json.data.imageUrl}`.replace(
							"\\",
							"/"
						);
					} catch (err) {
						setError("Please Try again, you may have invalid image.");
					}
				} catch (err) {
					setError(err.message);
				}
				setTimeout(() => {
					setLoading(false);
					setUploadedUrl(url);
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
					<img src={file.preview} alt={`${file.name} preview`} />
				</div>
			</div>
		));
	}, [files]);

	const { ref: dragRef, ...inputProps } = getInputProps();

	console.log(copied);

	return (
		<div className="App">
			<main data-uploaded={!!uploadedUrl}>
				{error ? (
					<>
						<h1>Error: </h1>
						<p>{error}</p>
					</>
				) : !loading ? (
					uploadedUrl ? (
						<>
							<Check />
							<h1 className="large-margin">Uploaded Successfully!</h1>
							<img className="large-margin uploaded" src={uploadedUrl} alt="" />
							<span className="url-display">
								<span>{uploadedUrl.replace("\\", "/")}</span>
								<CopyToClipboard
									onCopy={() => {
										// set copied to true
										setCopied(true);
									}}
									text={uploadedUrl}
								>
									<button>Copy Link</button>
								</CopyToClipboard>
							</span>
						</>
					) : (
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
					)
				) : (
					<>
						<h1>Uploading...</h1>
						<BarLoader color="#1D8BF1" className="loader" height="10" />
					</>
				)}
				{(error || uploadedUrl) && !loading && (
					<button onClick={reset}>Upload a new image</button>
				)}
			</main>
			<Snackbar
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				open={copied}
				autoHideDuration={6000}
				onClose={handleClose}
				message="Copied"
				action={
					<IconButton
						size="small"
						aria-label="close"
						color="inherit"
						onClick={handleClose}
					>
						<CloseIcon fontSize="small" />
					</IconButton>
				}
			/>
		</div>
	);
}

export default App;
