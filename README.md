# Standby's Event Discord Bot

This is a small proof of concept to recreate something similar to the **Apollo Bot** on **Discord**. Why did I need it? Becuase I am part of a small community that uses Apollo on Discord to organize simracing events and the different features that would make our participation process easier are not for free... Therefore I've created this small discord bot to create an event that fits better to our needs.

So, this is a simple and interactive **Discord bot** that helps you create events with custom RSVP options in a private conversation. Users can sign up for options (like "I'm coming", "Maybe", "Waitlist") by clicking buttons. Great for gaming groups, teams, or communities that would like to involve a little-bit of role handling as well.



## What can this bot do?

- Ask you (privately) about your event details
- Post the event into a public channel with join buttons
- Track which users clicked which button
- Support role-based access and limits per option
- Let you delete an event with a button (admin only)
- Keep your event data clean and tidy automatically



## What you need before you start

1. A free [Discord account](https://discord.com)
2. A Discord server where you are an **admin**
3. A [GitHub](https://github.com) or any other version control system account
4. Node.js installed on your computer (see below)
5. A bit of patience :D



## How to install it (on your computer)

### Step 1 – Install Node.js (if you don’t have it yet)

Go to [https://nodejs.org](https://nodejs.org) and download the **LTS version** (recommended for most users). Install it like any other app.

You can check it works by running:

```bash
node -v
npm -v
```

If you see version numbers, you're good to go.

### Step 2 - Download the bot code

Go to this GitHub page: https://github.com/standby929/standby-event-bot
Click on the green `Code` button and choose `Download ZIP`. Then unzip the folder to your computer.

### Step 3 - Open a terminal (Command Prompt or PowerShell)

Go to the folder you just extracted the code. For example:

```bash
cd /c/discord/standby-event-bot
```

Then install the required dependencies:
```bash
npm install
```

### Step 4 - Set up your own Discord bot

#### Create a bot on the Discord Developer Portal

1. Go to https://discord.com/developers/applications
2 Click on `New Application`
3. Give it a name (e.g. Standby bot)
4. Go to the **"Bot"** section on the left and click `Add bot`
5. Under **Privileged Gateway Intents** enable:
    - Message Content Intent
    - Server Members Intent
6. Under **Token**, click `Copy` and save it somewhere (you'll need it soon)

#### Invite the bot to you server

1. Go to the **"Oauth2" > URL Generator**
2. Under **Scopes** check:
    - `bot`
    - `applications.commans`
3. Under **Bot Permissions** check
    - `Send Messages`
    - `Manage Messages`
    - `Read Message History`
4. Copy the generated URL at the bottom and open it in your browser
5. Choose your server and authorize the bot

### Step 5 - Create your `.env` file

In the project fodler, create a file called `.env` and paste this:

```ini
DISCORD_TOKEN=your-bot-token-here
CLIENT_ID=your-client-id-here
GUILD_ID=your-server-id-here
```

To find your:
- DISCORD_TOKEN -> from the bor page
- CLIENT_ID -> from the **Application > General info** page
- GUILD_ID -> right click your server name in Discord - Copy Server ID  
_(You must enable "Developer Mode" in Disord's settings first)_

### Step 6 - Start the bot!

In your terminal, just run:
```bash
npm run build
npm run start
```

You should see:
```bash
📦 Slash command registered.
✅ Bot logged in: standby-event-bot#0000
```

## Deployment (optional)

If you don't want to run the bot from your computer all the time, you can **deploy it to the cloud**. I am using [Render.com](https://render.com) (free tier available).

### Render.com setup

1. Create an account on [https://render.com](https://render.com)
2. Click "New Web Service"
3. Connect your GitHub or Bitbucket account and select your bot repository
4. Fill out the details:

   - **Name**: anything (e.g. `standby-bot`)
   - **Environment**: `Node`
   - **Build Command**:  
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:  
     ```bash
     npm run start
     ```
   - **Environment Variables**:
     - `DISCORD_TOKEN`: your bot token
     - `CLIENT_ID`: your client ID
     - `GUILD_ID`: your Discord server ID

5. Click "Create Web Service"

### Important tips:

- Make sure your code is pushed to GitHub or Bitbucket before creating the service
- Your `.env` file **should not be uploaded** to GitHub (add `.env` to `.gitignore`)
- Instead, enter the same values manually under **"Environment Variables"** in Render

Once deployed, the bot will run 24/7 without needing your computer on.  
You can still run it locally too — just don’t run both at the same time.

---

## How to create an event

In any server channel where the bot is present, type:

```bash
/standby-event
```

Then follow the steps the bot sends you in **private message**:

1. Choose the channel where the event should be posted
2. Set the title, start/end time
3. Add a description (optional)
4. Define the RSVP options (like "Coming", "Not coming", "Maybe", "Waitlist")

The bot will post an event card into the selected channel with buttons.

## Notes

- Only people with the correct roles (if defined) can click certain options
- You can define max number of people per option like this:  
```sql
Coming|Member|16
```
- Users can only sign up to one option at a time
- If they click again, it updates or removes their previous response
- Only admins can delete an event

## Bonus: Automatic cleanup

Events are stored in a `.json` file.  
Old events are automatically deleted after they end to keep data folder clean


The application is communicating in **hungarian** only for the time being. Later, maybe I will add multiple language support as well but it wasn't a priority thing for now.