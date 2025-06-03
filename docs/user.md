# User Documentation

Welcome to the VHC. This guide will walk you through the dashboard website and its various sub-applications.

## Contents
- [User Documentation](#user-documentation)
	- [Contents](#contents)
	- [General](#general)
		- [Interface Settings](#interface-settings)
		- [Navigation](#navigation)
		- [Footer](#footer)
		- [Flash Messages](#flash-messages)
	- [User Management and Auth.](#user-management-and-auth)
		- [Registration](#registration)
		- [Login](#login)
		- [Management](#management)
	- [Apps](#apps)
		- [Ranker](#ranker)
			- [Input](#input)
			- [Paraphrases (LLM Responses)](#paraphrases-llm-responses)
				- [Ranker \& Pass/Fail](#ranker--passfail)
			- [Review \& Submit](#review--submit)

## General

### Interface Settings

The dashboard hijacks the browser's default zoom controls (`ctrl+=`, and `ctrl+-`) to provide a more pleasant zooming experience. Current zoom level and mouse controls for the same can be found in the sidebar. Global font scale is bounded between `12px` and `18px`.

![Interface Settings](images/interface.png)

### Navigation

The dashboard's primary navigation can be found at the top of the page. The main navigation links are accessible via keyboard shortcuts: `ctrl+[0-9]`.

![Primary Navigation](images/navigation.png)

### Footer

The footer at the bottom of the page serves as a constant repository of links to resources and important locations within the dashboard itself.

![Footer](images/footer.png)

### Flash Messages

The dashboard will occasionally "flash" a transient message to relay information or confirm the success of an operation. The message will appear once, and will disappear as soon as the user navigates away from the page.

![Flash Messages](images/flash.png)

## User Management and Auth.

The dashboard uses an entirely local auth. system, with support for [administrative functions](#admin), and role-based access. As a new user, your first experience with auth. will be:

### Registration

Registration on the dashboard is processed in the form of a request, subject to approval by site administrators. To register, you must navigate to `/register`, accessible via either the link on either the login portal or entry in the **Quick Links** section of the footer. 

A registrant is prompted for the following details (mandatory fields in bold):

- **Unique user ID**
- **Unique email ID**
- **ORCiD ID**
- Phone no.
- **Password**
- Comments (for the benefit of the approving authority)

> [!NOTE]
> Once set, the ORCiD cannot be updated

You will be notified via flash message following a successful registration request submission.

![Registration](images/registration.png)

### Login

Registered users may navigate to `/login` to begin an authenticated session. 

> [!NOTE]
> Users who have submitted a registration request but have not yet been approved will not be allowed to log in, and will be notified as such.

![Login](images/login.png)

### Management

Registered users may navigate to `/user` to view and manage their user instance. Users are allowed to edit their:

- Email ID
- Phone no.

![User](images/user.png)

Users may also update their password - there is no provision as of now for account recovery; ensure you do not forget your password.

![User](images/password.png)

## Apps

### Ranker

![User](images/ranker-basic.png)

Users with access to the ranker will assess and rank LLM paraphrases of a given input prescription text (black box, top left). Users will assign a numerical rank and a pass/fail status to each paraphrase, the latter status indicating a completely untenable LLM output. The ranker will automatically enforce any ranking/status constraints.

The full ranker view for a given input is called a "ballot" for that input.

#### Input

![User](images/ranker-input.png)

The raw transcribed prescription text.

#### Paraphrases (LLM Responses)

![User](images/ranker-responses.png)

Individual paraphrases, (anonymously) labelled by LLM. Paraphrases produced by "LLM-A" do not necessarily refer to the same LLM across ballots.

##### Ranker & Pass/Fail

![User](images/ranker-actions.png)

Two actions per paraphrase, each a radio-group of choices. Left for numerical rank, right for pass/fail status. The rightmost dot-matrix display indicates the rank assigned to the paraphrase, with "?" signifying no rank assigned, and green/red signifying pass/fail respectively.

> [!NOTE]
> See the border of the ranker for keyboard shortcuts.

#### Review & Submit

![User](images/ranker-review.png)

Review your final ranking, with `x > y` indicating `x` is ranked higher than `y`. Failing entries are underlined in red. The submit button will be enabled upon completion of all rankings for the ballot.
