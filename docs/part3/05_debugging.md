# Debugging and Fault Localization


## Reproduction

The most important first task of fixing bugs is to _reproduce_ the bug. While some bugs can be localized based on a user's vague description, most are not. Creating conditions in which the bug can be _reproduced_ (i.e., triggered in your envrionemtn) is key, because this then allows you to use tools like the debugger, and write unit tests to ensure


## Regression

When fixing a bug, you must ensure that your fix does not engender new bugs. You may think a change will only impact the scenario in which the bug happens, but in a stateful system, it is very possible your change may unexpectedly effect some other part of the system. A bug "fix" that breaks existing behaviour is rarely acceptable in a software system with many users.

<details class="tooltip deep-dive">
<summary>When Are Breaking Bug Fixes Allowed?</summary>

Software design is a practice of tradeoffs. Usually, a bug fix that stops some regular functional paths of software is unacceptable. But, there are exceptions. A serious security bug, for instance, may be temporarily patched with a bug fix that disables a useful behaviour altogether.

<!--- CL: I know this is silly but also it being a game makes it easy to understand without getting into all the details? Should probably remove--->
The [Falador Massacre](https://en.wikipedia.org/wiki/RuneScape#Falador_Massacre) was the, rather dramatically-named, result of a bug in the [MMORPG](https://en.wikipedia.org/wiki/Massively_multiplayer_online_role-playing_game) RuneScape. RuneScape was an online game in which player-versus-player combat was disabled in _most_ of the game. Only special zones, including "The Wilderness", and in some parts of player-owned housing, allowed player-versus-player (PvP) combat. Cities such as Falador were meant to be safe from this combat. When a player is killed by another player, the killed player loses all the items they had on them.

In short, the bug was that, when players were kicked out of a player-owned house while in a PvP-enabled state, this PvP-enabled state remained. Thus, some players were able to attack players in what were supposed to be safe zones. This caused a significant amount of chaos.

As the bug happened in the middle of the night for the game developers, the developer on-call that night [deployed a simple fix](https://youtu.be/ukbkU_dPKrU?si=A1QEkVbFlnZG5Jn_&t=3560): no longer allowing the house to set the PvP-allowed state, and preventing that PvP-allowed state from, well, allowing PvP. This disabled significant PvP features in the game, but the cost of disabling these features was less than the cost of letting the "massacre" go on unchecked.

The game code was later updated to [add a notion of "areas" to the game](https://youtu.be/ukbkU_dPKrU?si=l1K9BgG4NC9AYwYT&t=3650), which could be cross-checked to ensure that variables (such as the PvP-enabled state) are not enabled in areas where they should not be. 
</details>

The best way to ensure that your change does not cause new problems is through regression testing. Test suites are useful not just to implement your new feature, but also to ensure that all the previous behaviours you tested are maintained.



## Challenge: Bug-Fixing in a Public API

A real challenge emerges when a bug is revealed in a public API, which you have users of.  
