Lightweight wrapper for interacting with the Dexcom (private) API

Caution: In beta, use at your own risk. This is unsupported by Dexcom and may
break in the future.

FAQ:
> Why not use the the official Dexcom API?
The official Dexcom API unfortunately has a 3 hour delay on fetching EVG data.
This is a non-starter if you want to do any sort of realtime work, eg. showing
values on a watch.
> How stable is the unofficial API?
In my experience of the past two years, the API has changed in a breaking way
twice.

TODO:
* Support US and EU accounts
* Support cache for accountId (user supported?)
* Initialization object that accepts username/password context
* Tests
