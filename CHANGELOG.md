CHANGELOG
=========

v0.2.6 - 05/10/15
* Bugfix for devicePixelRatio rounding error
* Avoid taking multiple screenshots for stitching if stitching is not required
* Add horizontal padding for browser adjustment in cases where the website does something weird
* Add adjust method to driver and chain for adjusting Taxi settings for screenshots and others

v0.2.5 - 05/04/15
* Remove unnecessary spaces in folder/file names for comparison

v0.2.4 - 05/04/15
* Switch synchronous request library - experimental

v0.2.3 - 04/26/15
* Add element padding for capture and compare
* Bugfixes

v0.2.2 - 04/24/15
* Bugfixes

v0.2.1 - 04/24/15
* Add window location and sizing methods to chain interface

v0.2.0 - 04/23/15
* Add examples
* Add chain-mode
* Add compatibility-mode
* Add screenshot stitching
  * Add device-pixel-ratio determination
  * Add stitching determination
  * Add document screenshot
  * Add viewport screenshot
  * Add area screenshot
  * Add element screenshot
  * Add block-out (custom and element)
* Add comparison methods
  * Add Blink-Diff
  * Add document comparison
  * Add view-port comparison
  * Add area comparison
  * Add element comparison

v0.1.0 - 04/10/15
* Update http-client for synchronous and asynchronous requests

v0.0.2 - 03/05/15
* General cleanup

v0.0.1 - Initial release 03/05/15
* Fork of Cabbie
