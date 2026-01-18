---
author: Shubham Lad
pubDatetime: 2024-06-18T13:02:54Z
modDatetime: 2024-06-18T13:02:54Z
title: "Learning from mistakes - Revert/Reset the branch in right way."
slug: git-reset-right-way
featured: false
draft: false
description: A clear, intuitive explanation of how to revert/reset the branch in right way.
---


![reset giphy](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXdvN2Z4NDNxanB2cmZmbDRjOGFmZTF2eDE2Z3YzZTZhb292M3F4YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TWTCdemH9OoEmx3iYq/giphy-downsized.gif)

Warning: this is going to be a long post. Grab yourself some coffee, get comfortable, and start reading.

Of course, if you are a developer, mistakes happen. This also happened in my last project. We were working on one big module, which has a lot of commits and tons of code changes. We were ready with the module after lots of hard work. 🥳 Finally, the day came when our feature branch merged with the staging. Everything was going perfectly well until one fine morning when my manager told me that we had to roll back all the changes that we pushed because the client wanted to prioritize some other module, and the testing team was investing more time into the testing of our module.

I said no problem! I will do it 👍

We started the dangerous process of reverting the commits that we pushed. However, we thought: It's Git, it will be simple. We selected the commit just before our merge request, and we reverted our branch to that one. Everything was all right; we pushed the changes. But in the evening, our test team started reporting errors.

We started analyzing the errors, and we found out that our revert, where we picked a commit just from last week, has, deleted some of the commits from the 11 months. We screwed up. 

Then I started reading about this git, exploring the commits, how git keeps track of the commits. After some study, I came to know that we made the wrong choice of commit for reset. We had a backup branch, and again, we restored everything. And this time around, I did it the right way. and It Worked. 

So today, I am sharing my learning from all this mess so you will not face these issues.

# So, how do we reverse the changes merged into the branch?

So there are actually two methods to revert your changes from the branch
1. use the revert command - safe one
2. use the reset command - 😈

But, before discussing this, let's view some of the essential things in Git.

# Parent Commit

Have you ever had thoughts on what is parent commit?

Check out this diagram and, by using it for reference, try to understand the points given below.

![Parent Commits](https://res.cloudinary.com/dju7jxioz/image/upload/v1718611753/commit_parent_kbijqn.webp)

The parent commit is the commit that this commit is based on. Typically:

- When you `git commit` usually, the current commit becomes the parent commit of the new commit introduced by the command.
- When you `git merge` two commits (or branches, whatever) without fast-forwarding, a new commit will be created with _both_ commits (the latest commit from the main branch and the latest commit from the feature branch) as parents. 

> Note that more than two commits can be merged this way, so the new commit potentially has more than one parent.

# 1. Revert command

Let's talk about the `revert` command: how we use it, what problems we might be facing in the future using it, and how to resolve them.

So, you can think about it as an operation to undo using `git revert`, but in a different way than we are used to with normal undo. This operation will not manipulate our git history; that is to say, it won't remove any previous commits. Instead, it will create a new commit with the changes reverted.

This is considered to be the safest option for reverting your changes in a collaborative environment, as it will not break the Git history.

### How `git revert` works


Unlike the `git reset` command, where we move the `HEAD` and branch ref pointers to a specified commit, the `git revert` command uses that specific commit to invert the changes and effectively makes a new reverse commit that only removes the modifications done by the commit. The ref pointers are then updated to point at the new revert commit, making it the tip of the branch.

#### 1. Single Commit

In most cases, its as simple as running `git revert <commit-sha>`

![revert_single_commit](https://res.cloudinary.com/dju7jxioz/image/upload/v1718623452/revert_single_commit_lyfdzg.webp)

Example: Let's say you are working on an `example-feature` branch, and you want to revert `C` commit, then run the command: `git revert cea02f0`. This will create a new revert commit `R` with all the changes inversed.

Notice the parent of this new commit.

#### 2. Merge Commit

It's simple, right? But when it comes to reverting merge commits, things get a little confusing. Simply doing a revert on a merge commit will fail:

Let's try with our merge commit `M`. 

```bash
❯ git revert dc8aff641468dc85d22f499c1c4c93a0d4fcaf58
error: commit dc8aff641468dc85d22f499c1c4c93a0d4fcaf58 is a merge but no -m option was given.
fatal: revert failed
```

Why this happened? See the diagram below and notice our merge commit. It has two parents. Git is asking for the mainline number and, in other words, the parent number.

![revert_merge_commit](https://res.cloudinary.com/dju7jxioz/image/upload/v1718623452/revert_merge_commit_tcjfjo.webp)

As we saw a commit’s parent is the commit on top of which the commit is applied. In contrast to other commits, a merge commit has two parents.

The branch `example-feature` is checked out from the main (`X` commit) and later merged into the branch `main` with a merge commit `M`. In this case, `M` has two parents.

- Parent 1: X (f572d39)
- Parent 2: C (cea02f0)

If one is to revert the changes that were applied on Branch `main` because of the merge `M`, they want the mainline as `X`, so `Parent 1`.

```bash
❯ git revert dc8aff641468dc85d22f499c1c4c93a0d4fcaf58 -m 1
```

What Git does is it reverts the diff between `M` and `X` and creates a new revert commit, `R`.

#### Problem with Revert

Now let's assume you reverted your merge changes because of some reason and now after fixes and some changes you are ready to merge your feature branch again in the main branch, then good luck. You will only see the new chnages that you made but you will not see any previous changes you did in that branch before merge `M`.

It's because "revert" undoes the data changes, but it's very much _not_ an "undo" in the sense that it doesn't undo the effects of a commit on the repository history.

So if you think of "revert" as "undo", then you're going to always miss this part of reverts. Yes, it undoes the data, but no, it doesn't undo history.

In such a situation, you would want to first revert the previous revert, which would make the history look like this:

```
 ---X------------------M---R---xR---W---
     \                /            /
       ---A---B---C------D--------
```

where `xR` is the revert of `R`.  Such a "revert of the revert" can be done with:

```bash
❯ git revert R
```

Now you can merge your feature branch with main branch, as a effect of revert all your previously merged changes will be present now on the main branch.

# 2. Reset command

The `git reset` command is used to undo changes in your repository. More specifically, it moves the HEAD pointer back to a commit, effectively taking the state of the working directory back to that commit.

Three basic categories of resets:

- **Soft Reset (`--soft`)**: Moves HEAD to the given commit but does not touch the index or working directory.

- **Mixed Reset (`--mixed`)**: Moves the HEAD where specified to a commit, updates the index without changing the working directory.

- **Hard Reset (`--hard`)**: Moves the HEAD to the specified commit and updates both the index and the working directory to match that commit.

Suppose you would like to reset all the merged changes on the `main` branch. To do so, we will refer to the diagram as follows:.

![reset_commit](https://res.cloudinary.com/dju7jxioz/image/upload/v1718623452/reset_commit_nmguay.webp)

So here we had to do a hard reset of all the changes committed by the commit `M`. Check the diagram above: here, after we merged our `example-feature` branch into `main`, the particular merge commit `M` recorded two parents.

- Parent 1: X (f572d39)
- Parent 2: C (cea02f0)

This we saw previously, and we also know that before merging our feature branch, the `main` branch was on `X` commit. So if we want to reset all the changes we added because of the merge request, we need to reset this branch to `Parent 1` which is up to commit `X`.

Now that you have the exact commit to reset, run the following command:

```bash
❯ git reset --hard f572d39ab390c2f8bb442363d2df870b6adb6488
```

As mentioned, `--hard` will move the HEAD to the `f572d39` commit and update the index and the working directory to match that commit.

#### Potential Risks

Use of `git reset` has some risks, particularly if used carelessly:

1. **Data Loss**: Changes in the working directory that are not committed will be lost after doing `git reset --hard`. Ensure that you have committed or stashed your changes that matter before you run a hard reset.

2. **History Rewriting**: Reset changes the commit history. This might be a nightmare in a shared development environment since if others have pulled or pushed in the same branch, this will make history inconsistent and makes the collaboration harder.

3. **Unintended State**: This resetting can lead to your repository being in an unintended state if, say, you reset by mistake to the wrong commit. Always cross-check the commit hash you are resetting to and be clear about what kind of reset is happening. 

> Actual Scenario: We had to face this third risk. With the wrong selection of commits, some of the changes made 11 months ago were lost, but because we had a backup of the branch, all changes were recovered.

References:
- [Revert a faulty merge](https://github.com/git/git/blob/master/Documentation/howto/revert-a-faulty-merge.txt)
- [Git reset](https://www.atlassian.com/git/tutorials/undoing-changes/git-reset)
- [Madara\'s Ghost comment](https://stackoverflow.com/a/38239664)
- [What are parents on a merge commit?](https://blog.experteer.engineering/what-are-parents-on-git-merge-commits.html)