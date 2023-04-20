'use client';
import { useRef, useState } from 'react';
import useSWR from 'swr';
import Head from 'next/head';

const Form = () => {
	const options = ['Adventure', 'Shopping', 'Chill', 'Art', 'Nature'];
	const [response, setResponse] = useState<string>('');
	const [destinationInput, setDestinationInput] = useState<string>('');
	const [numDays, setNumDays] = useState<number>(1);
	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleOptionClick = (value: string) => {
		const newSelectedOptions = selectedOptions.includes(value)
			? selectedOptions.filter((v) => v !== value)
			: [...selectedOptions, value];

		setSelectedOptions(newSelectedOptions);
	};
	const buildStringFromArray = (arr: string[]) => {
		let str = '';
		for (let i = 0; i < arr.length; i++) {
			if (i == arr.length - 1) {
				str += `${arr[i]}`;
			} else {
				str += `${arr[i]}, `;
			}
		}
		return str;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		//add validation for inputs
		setIsLoading(true);
		e.preventDefault();
		let likes = buildStringFromArray(selectedOptions);
		let query = `Give me a travel itinerary to ${destinationInput} for ${numDays} days. I like ${likes}. `;

		const response = await fetch('/api/response', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message: query,
				currentModel: 'gpt-3.5-turbo',
			}),
		});
		console.log('Edge function returned.');

		console.log(response);

		if (!response.ok) {
			throw new Error(response.statusText);
		}

		const data = response.body;
		if (!data) {
			return;
		}

		const reader = data.getReader();
		const decoder = new TextDecoder();
		let done = false;

		while (!done) {
			const { value, done: doneReading } = await reader.read();
			done = doneReading;
			const chunkValue = decoder.decode(value);
			setResponse((prev) => prev + chunkValue);
		}
		setIsLoading(false);
	};

	const tryAgain = () => {
		setResponse('');
	};

	return (
		<div className='flex flex-col items-center justify-center bg-gray-900 text-white min-h-screen'>
			<Head>
				<title>TravelGPT</title>
				<meta name='description' content='TravelGPT website' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<main className='max-w-xl mx-auto py-8 px-4 flex flex-col '>
				<h1 className='text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text text-center mb-8'>
					TravelGPT
				</h1>
				{response.length == 0 && (
					<form onSubmit={handleSubmit} className='w-full'>
						<div className='mb-4'>
							<label htmlFor='destination' className='block mb-2 font-bold'>
								Destination
							</label>
							<input
								type='text'
								id='destination'
								placeholder='Enter destination'
								className='text-white w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-transparent'
								value={destinationInput}
								onChange={(e) => setDestinationInput(e.target.value)}
							/>
						</div>
						<div className='mb-4'>
							<label htmlFor='days' className='block mb-2 font-bold'>
								Number of days
							</label>
							<input
								type='number'
								id='days'
								min={1}
								max={5}
								step='any'
								placeholder='1'
								className='text-white w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-transparent'
								value={numDays}
								onChange={(e) => setNumDays(Number(e.target.value))}
							/>
						</div>
						<div className='flex flex-col items-start w-full'>
							<span className='font-medium text-white'>Selected:</span>
							<ul className='flex flex-wrap'>
								{selectedOptions.map((option) => (
									<li
										key={option}
										className='inline-flex items-center px-2 py-1 my-1 mr-2 text-sm font-medium text-white bg-pink-600 rounded-full'>
										{option}
										<button
											className='flex-shrink-0 ml-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500'
											onClick={() => handleOptionClick(option)}>
											<span className='sr-only'>Remove</span>
											<svg
												className='w-4 h-4'
												fill='currentColor'
												viewBox='0 0 20 20'>
												<path
													fillRule='evenodd'
													d='M5.293 6.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 011.414 0l.707.707a1 1 0 010 1.414L11.414 11l2.293 2.293a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414 0L10 12.414l-2.293 2.293a1 1 0 01-1.414 0l-.707-.707a1 1 0 010-1.414L8.586 11 6.293 8.707a1 1 0 010-1.414l-.707-.707z'
													clipRule='evenodd'
												/>
											</svg>
										</button>
									</li>
								))}
							</ul>
							<select
								multiple
								value={selectedOptions}
								onChange={() => console.log()}
								className='block w-full py-2 pl-3 pr-10 leading-5 text-white bg-transparent border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-pink-600 focus:border-pink-600 sm:text-sm'>
								{options.map((option) => (
									<option
										key={option}
										value={option}
										onClick={() => handleOptionClick(option)}>
										{option}
									</option>
								))}
							</select>
						</div>

						<button
							type='submit'
							disabled={isLoading}
							className='w-full bg-pink-500 text-white py-2 px-4 rounded-lg font-bold hover:bg-pink-600 mt-5'>
							Submit
						</button>
					</form>
				)}
				{isLoading && (
					<div role='status' className='mx-auto my-2'>
						<svg
							aria-hidden='true'
							className='w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-pink-600'
							viewBox='0 0 100 101'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
								fill='currentColor'
							/>
							<path
								d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
								fill='currentFill'
							/>
						</svg>
						<span className='sr-only'>Loading...</span>
					</div>
				)}
				{response && <p className='text-center'>{response}</p>}
				{response.length > 0 && !isLoading && (
					<button
						onClick={tryAgain}
						disabled={isLoading}
						className='w-full bg-pink-500 text-white py-2 px-4 rounded-lg font-bold hover:bg-pink-600 mt-5'>
						Try Again!
					</button>
				)}
			</main>
		</div>
	);
};

export default Form;
