# ECE_461
**ECE 46100 Software Engineering Group 4**

---

## Team Members:
- Robert Sego
- Priyanka Pereira
- Andy Lin
- Ryan Marchand

## Setup instructions:
The following assumes a default bash shell environment.

**First step is to set up your GITHUB_TOKEN environment variable**
- Follow the instructions [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) to create a new Github personal access token (CLASSIC, not the beta fine-grained tokens)
- Set it to expire in the end of the semester (I did May 30th)
- The scopes I selected are as follows:
	- codespace, notifications, read:audit_log, read:discussion, read:enterprise, read:packages, read:project, 		repo, user, workflow
- Copy the token you generated to your clipboard
- Run the following at the command line

```
cd ~/.ssh
```
- Create a new file called git_token
- Paste the token into this file and save. For the scripts to run, the file must be named git_token and placed in the .ssh directory.



**Second step is to run the setup scripts**

- Clone repository to local machine
- Run initial_setup script only once on any new environment.

```
scripts/initial_setup.sh
```

>Ignore the detached HEAD error - it's fine!

- Source setup script manually each time you log in or add to .bashrc

```
source scripts/setup.sh
```
Note that this script also sets the environment variable GITHUB_TOKEN.
- Install Node.js with nvm - this is important so uninstall any existing node you have. We want to be able to switch which version of node we are running so we can work with eceprog! eceprog runs node version 12. nvm allows the switching to occur without reinstallation.

```
nvm install node
```

- Install octokit (for use with Github APIs)

```
npm install octokit
```

## Each time you log in and start working
- Must source setup script

```
source scripts/setup.sh
```
