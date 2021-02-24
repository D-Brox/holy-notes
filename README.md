# Holy Notes
 A Powercord plugin that lets you keep messages in a Notebook, as personal pins.


### Description:

To save a note, right click a message, use the button on the toolbar or save through command. To delete note, use  the delete button on the Notebook or delete through command.

Notebook Commands:

- [prefix]notebook open [...]: Opens Notebook, or a Note if given it's Link, Index or Message ID
- [prefix]notebook write [link]: Writes Note given it's Message Link
- [prefix]notebook erase [arg]: Erases Note from your Notebook given it's Link, Index or Message ID

 
#### TODO:

- Polishing?

#### Quick notes:

* Notes with embeds added before 1.2.0 may break notebook and crash discord if they have a timestamp. To fix, just delete the timestamp inside the embed in notes.json
* You may be unable to jump to DM notes added before 1.2.4 . To fix, replace the 'null'  segment of the 'Message_URL' with '@me' in notes.json
* If you don't have a user cached and there is a note from that user, it may crash discord. This will be fixed in 1.2.5.

* Please report any crash not associated with the ones above. It may be a problem of compatibility with other plugins.
