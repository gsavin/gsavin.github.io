---
layout: post
---

Continuons dans cette série d'articles orientés électronique, mais dans ce dernier, le rôle principal ne sera plus tenu par un Arduino mais par un Raspberry PI. Grâce à son port GPIO, il est possible de connecter directement des composants électroniques sur le PI. Dans la suite, nous allons voir comment exploiter un XBee pour communiquer avec d'autres appareils équipés de ce module.

## Installation du système

Avant d'aller plus loin, il est bien sûr nécessaire d'installer un système sur votre Raspberry PI. Pour ma part, j'ai opté pour la version ARM de ma bien-aimée ArchLinux, dont vous pourrez télécharger l'archive pour le PI [ici (4)](http://archlinuxarm.org/platforms/armv6/raspberry-pi). Il est fort probable que vous rencontriez un problème pour accéder au port série situé sur le GPIO, et accessible au travers de `/dev/ttyAMA0`. Par défaut, le noyau démarre en ouvrant une console sur ce port, ce qui a pour effet de le rendre inaccessible. Vous pouvez vous en rendre compte avec une commande du type `ps -ef | grep tty` qui devrait vous afficher un agetty ouvert sur `ttyAMA0`. Pour désactiver cette console, il suffit de supprimer la paramètre `console=ttyAMA0,115000` du fichier `/boot/cmdline.txt` Vérifiez bien aussi que l'utilisateur dont vous endosserez l'uid fasse bien partie du groupe `uucd`, ayant accès en lecture/écriture au périphérique `ttyAMA0`.

## Le port GPIO

Une fois le système en place, il vous faudra connecter le XBee sur le port GPIO. Voici un récapitulatif des différents pins de ce port :

![](/img/posts/Raspberry-Pi-GPIO-pinouts.png "Raspberry PI GPIO")

La partie gris/bleu (`GPIO14/GPIO15`) correspond à la partie UART, et donc à notre port série `ttyAMA0`. Les pins du GPIO sont alimentés en 3.3V (voir [1]), ce qui nous arrange car le XBee fonctionne à ce voltage. Il suffit donc de connecter les pins Rx/Tx du XBee à ceux du PI, ainsi que l'alimentation 3.3V et la masse. Et s'il faut vous faire un dessin, en voilà un :

![](/img/posts/xbee-on-pi_bb.png "XBee on PI")

## Un peu de code

Il ne reste plus qu'à écrire quelques lignes de code pour exploiter notre XBee. Le plus simple que j'ai pu trouver utilise du python, avec les bibliothèques "XBee" et "pyserial". Installez python2 et pip avec la commande `sudo pacman -S python2 python2-pip` puis les paquetages via la commande `sudo pip2 install XBee pyserial`. En supposant que vous ayez configuré `sudo`, sinon vous pouvez passer en root avec la commande `su` (mot de passe : root).

Le script suivant permet de démarrer le XBee sur le réseau 1111 en mode coordinateur avec comme adresse 0x3141. On parle ici de XBee série 1, et je fais la configuration directement dans le script, mais le XBee peut très bien avoir été configuré au préalable via un XBee Explorer par exemple. Une fois configuré, le script attend des messages réçus par le XBee et les affiche sur la console.

{% highlight python %}
import serial, sys
from xbee import XBee

SERIALPORT = "/dev/ttyAMA0"
BAUDRATE=9600

ser  = serial.Serial(SERIALPORT, BAUDRATE)

def write_check(cmd):
	ser.write(cmd)

	b = 0
	r = ''

	while b != '\r' and b != '\n':
		b = ser.read(1)
		r = r + b

	if r[:2] != "OK":
		print "!!! XBEE NOT OK !!!"
		return False

	return True


print " * Waiting for the XBee..."

if write_check("+++"):
	print " * XBee ready ! Configuring it now..."
else:
	sys.exit(1)

write_check("ATRE\r")
write_check("ATAP2\r")
write_check("ATCE1\r")
write_check("ATMY3141\r")
write_check("ATID1111\r")
write_check("ATCH0C\r")

print " * Writing configuration..."

if write_check("ATCN\r"):
	print " * Configuration done. Start listening..."
else:
	sys.exit(1)

xbee = XBee(ser)

while True:
	try:
		r = xbee.wait_read_frame()
		print r
	except KeyboardInterrupt:
		break

ser.close()
{% endhighlight %}

## Pour aller plus loin...

Il est possible d'accèder aux autres pins du port GPIO, pour ajouter quelques jolies LED par exemple que vous pourrez allumer quand vous recevrez un email. Je me dédouane dès à présent de toute transformation de votre domicile en guirlande de noël. Si cependant, en toute connaissance des risques, vous souhaitez continuer, il vous faudra installer l'outil `wiringpi`.

Par exemple, si vous branchez une led sur le pin GPIO17, vous pourrez l'allumer (ou l'éteindre) via la commande :

{% highlight bash %}
gpio -g mode out 17
gpio -g write 17 1 # Remplacer par 0 pour éteindre
{% endhighlight %}

## Utilisation du I2C

à venir...

### Sources / Liens

1. [Raspberry PI Documentation](https://www.raspberrypi.org/documentation/hardware/raspberrypi/gpio/README.md)
2. [Raspberry Tempature Monitor Project](http://www.brettdangerfield.com/post/raspberrypi_tempature_monitor_project/)
3. [Examples GPIO](https://projects.drogon.net/raspberry-pi/gpio-examples/tux-crossing/gpio-examples-1-a-single-led/)
4. [ArchLinux ARM](http://archlinuxarm.org/platforms/armv6/raspberry-pi)
