# Reddit launch attempt receipt

Channel: r/codex

Account: `u/nightlydaytrader`

Submitted manually by the owner: approximately 2026-09-10 23:56 EDT

Verified in the logged-in Chrome UI: 2026-09-10 23:57 EDT

URL: https://www.reddit.com/r/codex/comments/1wd5b35/i_built_a_projectfirst_chat_picker_for_codex_in/

## Outcome

Reddit accepted the submission and created the URL, but the post page immediately displayed
"Sorry, this post was removed by Reddit's filters." Treat this as a filtered launch attempt, not
an active publication or a demand result. The visible initial state was score 1 and 0 comments;
neither is useful engagement evidence while the post is filtered.

The owner performed the submission manually. No bot posted it. The post used the `Showcase` flair,
and the 11-second video rendered on the post page. The final copy, author, flair, URL, video, and
filter message were independently read back in the logged-in Chrome UI.

Rule 5 says r/codex moderation is partly automated, acknowledges that the moderator bot can make
mistakes, and directs authors to Modmail when that happens. Rule 4 says Showcase and high-effort
useful posts are not subject to its low-comment-karma delay rule. Those rules do not reveal why
this post was filtered. Recommended next action: send one concise Modmail appeal; do not repost or
change channels until the moderators respond or the post becomes publicly visible. The owner
subsequently approved the exact appeal below, and it was sent September 11 at approximately
00:38 EDT.

## Modmail appeal receipt

Destination: r/codex moderators

Sender: `u/nightlydaytrader`

Sent: approximately 2026-09-11 00:38 EDT

Subject: **Showcase post removed by automated filters**

> Hi mods — my r/codex Showcase post was automatically removed immediately after submission:
> https://www.reddit.com/r/codex/comments/1wd5b35/
>
> It’s a detailed post about an open-source VS Code utility I built for organizing Codex chats by
> project. I disclosed that I’m the author, used the Showcase flair, submitted manually, and
> reviewed the subreddit rules beforehand.
>
> Would you please review whether it can be approved? I won’t repost while waiting. Thanks.

The Reddit UI displayed `Message sent` and cleared the form after submission. No additional
message or repost was sent.

## Automated moderator response

At 2026-09-11 00:38 EDT, the `modmail-karma` moderator account replied automatically. The response
reported that `u/nightlydaytrader` has 0 r/Codex comment karma and that the moderation team does not
respond to accounts with less than 1 subreddit comment karma. It said this is probably why the post
was removed, encouraged participation in r/Codex discussions, and also said highly detailed and
helpful posts are allowed regardless of karma.

This is an automated template, not a human review or proof of the sole filter cause. Its probable
cause and its high-detail exception are in tension because this submission was a detailed Showcase.
The actionable gate is nevertheless clear: do not reply or repost now. Participate genuinely in
r/Codex, verify that the account's displayed r/Codex comment karma is at least 1, then recheck the
original post. If it remains filtered, request one human review in the existing Modmail thread.

## Exact submitted copy, revision r3

Title: **I built a project-first chat picker for Codex in VS Code (macOS, open source)**

I use Codex across several VS Code projects. Finding an older chat meant opening threads one by
one to figure out which repo they belonged to.

I built Project Chats to make that easier. Click **Project Chats** in the status bar or press
**Control+Command+H**. It groups chats by repo, puts the current workspace first, and shows the
branch and working directory before you open a thread.

I am the author. Source and installation instructions:
https://github.com/aijoe1/codex-project-history

It reads local metadata without modifying chat history. It is macOS-only, installs through GitHub,
and relies on undocumented Codex internals that could change.

I tested it across my workspaces and on a second Mac. The attached demo uses fictional chats to
show grouping and filtering, not real-chat reopening.

If you try it, I’d love to know: does it correctly put the project you’re currently working in at
the top?

If you share a screenshot, please blur private paths and chat titles.

## Media receipt

File: `../media/project-chats-button-demo-pullback-v0.1.5.mp4`

SHA-256: `894e6e9a4aba4e64e8cb930670d9f473b5bec2042b532568d486f64071364600`

Scope: synthetic grouping and filtering demo; not proof of real-chat reopening.

## Measurement boundary

No Reddit measurement clock has started. If moderators restore the post, independently verify
public visibility first and record that timestamp as the beginning of the exposure window. Keep
the original submission time and the public-visibility time separate.
