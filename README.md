# cf-update.js

This repository contains the code for updating Cloudflare IP addresses.

## Installation

To use `cf-update.js`, follow these steps:

1. Clone this repository
2. Install the required dependencies: `npm install`
3. Configure the necessary environment variables in a `.env` file. Refer to the `.env.example` file for the required variables.
4. Configure the necessary domain information from cloudflare in `domains.js` file. Refer to the `.env.example` file for required format. This file should contain the list of domains you want to update.
5. Run the script: `node cf-update.js`

## Usage

The `cf-update.js` script can be used to update the IP addresses associated with your Cloudflare account. It retrieves the latest IP addresses from the Cloudflare API and updates the necessary DNS records accordingly.

To use the script, run the following command:

```
node cf-update.js
```

This script can be best utilized with crontab to automatically update your DNS records and ensure that your domain is always matched with your dynamic IP.

## Configuration

The script requires the following environment variables to be set in a `.env` file:

- `CF_TOKEN`: Your Cloudflare API key.
- `NTFY_TOKEN`: (optional) token to send ntfy notification that requires authentication.

Make sure to create a `.env` file in the root directory of the project and populate it with the required values.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
