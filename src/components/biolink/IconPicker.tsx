import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search } from "lucide-react";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

const fontAwesomeIcons = [
  'fa fa-home', 'fa fa-user', 'fa fa-envelope', 'fa fa-phone', 'fa fa-globe', 'fa fa-link',
  'fa fa-download', 'fa fa-upload', 'fa fa-share', 'fa fa-heart', 'fa fa-star', 'fa fa-bookmark',
  'fa fa-calendar', 'fa fa-clock', 'fa fa-map-marker', 'fa fa-camera', 'fa fa-video', 'fa fa-music',
  'fa fa-play', 'fa fa-pause', 'fa fa-stop', 'fa fa-forward', 'fa fa-backward', 'fa fa-volume-up',
  'fa fa-volume-down', 'fa fa-volume-off', 'fa fa-microphone', 'fa fa-microphone-slash', 'fa fa-headphones',
  'fa fa-laptop', 'fa fa-desktop', 'fa fa-tablet', 'fa fa-mobile', 'fa fa-keyboard', 'fa fa-mouse',
  'fa fa-print', 'fa fa-fax', 'fa fa-copy', 'fa fa-paste', 'fa fa-cut', 'fa fa-edit', 'fa fa-save',
  'fa fa-folder', 'fa fa-folder-open', 'fa fa-file', 'fa fa-file-text', 'fa fa-file-pdf', 'fa fa-file-image',
  'fa fa-file-video', 'fa fa-file-audio', 'fa fa-file-archive', 'fa fa-file-code', 'fa fa-file-excel',
  'fa fa-file-powerpoint', 'fa fa-file-word', 'fa fa-database', 'fa fa-server', 'fa fa-cloud', 'fa fa-cloud-upload',
  'fa fa-cloud-download', 'fa fa-wifi', 'fa fa-signal', 'fa fa-battery-full', 'fa fa-battery-three-quarters',
  'fa fa-battery-half', 'fa fa-battery-quarter', 'fa fa-battery-empty', 'fa fa-plug', 'fa fa-lightbulb',
  'fa fa-sun', 'fa fa-moon', 'fa fa-cloud-sun', 'fa fa-cloud-rain', 'fa fa-snowflake', 'fa fa-umbrella',
  'fa fa-fire', 'fa fa-bolt', 'fa fa-flash', 'fa fa-magnet', 'fa fa-shield', 'fa fa-lock', 'fa fa-unlock',
  'fa fa-key', 'fa fa-eye', 'fa fa-eye-slash', 'fa fa-search', 'fa fa-search-plus', 'fa fa-search-minus',
  'fa fa-zoom-in', 'fa fa-zoom-out', 'fa fa-expand', 'fa fa-compress', 'fa fa-arrows-alt', 'fa fa-arrows',
  'fa fa-arrow-up', 'fa fa-arrow-down', 'fa fa-arrow-left', 'fa fa-arrow-right', 'fa fa-arrow-circle-up',
  'fa fa-arrow-circle-down', 'fa fa-arrow-circle-left', 'fa fa-arrow-circle-right', 'fa fa-chevron-up',
  'fa fa-chevron-down', 'fa fa-chevron-left', 'fa fa-chevron-right', 'fa fa-caret-up', 'fa fa-caret-down',
  'fa fa-caret-left', 'fa fa-caret-right', 'fa fa-sort', 'fa fa-sort-up', 'fa fa-sort-down', 'fa fa-sort-alpha-up',
  'fa fa-sort-alpha-down', 'fa fa-sort-numeric-up', 'fa fa-sort-numeric-down', 'fa fa-sort-amount-up',
  'fa fa-sort-amount-down', 'fa fa-random', 'fa fa-shuffle', 'fa fa-refresh', 'fa fa-sync', 'fa fa-redo',
  'fa fa-undo', 'fa fa-repeat', 'fa fa-rotate-right', 'fa fa-rotate-left', 'fa fa-exchange', 'fa fa-retweet',
  'fa fa-reply', 'fa fa-reply-all', 'fa fa-share-alt', 'fa fa-share-alt-square', 'fa fa-external-link',
  'fa fa-external-link-square', 'fa fa-link', 'fa fa-unlink', 'fa fa-chain', 'fa fa-chain-broken',
  'fa fa-code', 'fa fa-code-fork', 'fa fa-github', 'fa fa-github-alt', 'fa fa-github-square', 'fa fa-git',
  'fa fa-git-square', 'fa fa-bitbucket', 'fa fa-bitbucket-square', 'fa fa-gitlab', 'fa fa-stack-overflow',
  'fa fa-codepen', 'fa fa-jsfiddle', 'fa fa-dribbble', 'fa fa-dribbble-square', 'fa fa-behance',
  'fa fa-behance-square', 'fa fa-pinterest', 'fa fa-pinterest-p', 'fa fa-pinterest-square', 'fa fa-facebook',
  'fa fa-facebook-f', 'fa fa-facebook-square', 'fa fa-twitter', 'fa fa-twitter-square', 'fa fa-instagram',
  'fa fa-linkedin', 'fa fa-linkedin-square', 'fa fa-youtube', 'fa fa-youtube-play', 'fa fa-youtube-square',
  'fa fa-vimeo', 'fa fa-vimeo-square', 'fa fa-snapchat', 'fa fa-snapchat-ghost', 'fa fa-snapchat-square',
  'fa fa-tiktok', 'fa fa-whatsapp', 'fa fa-telegram', 'fa fa-discord', 'fa fa-skype', 'fa fa-reddit',
  'fa fa-reddit-alien', 'fa fa-reddit-square', 'fa fa-tumblr', 'fa fa-tumblr-square', 'fa fa-flickr',
  'fa fa-flickr-square', 'fa fa-vine', 'fa fa-vine-square', 'fa fa-foursquare', 'fa fa-foursquare-square',
  'fa fa-yelp', 'fa fa-yelp-square', 'fa fa-tripadvisor', 'fa fa-tripadvisor-square', 'fa fa-google',
  'fa fa-google-plus', 'fa fa-google-plus-square', 'fa fa-google-play', 'fa fa-google-wallet',
  'fa fa-paypal', 'fa fa-paypal-square', 'fa fa-cc-visa', 'fa fa-cc-mastercard', 'fa fa-cc-amex',
  'fa fa-cc-discover', 'fa fa-cc-paypal', 'fa fa-cc-stripe', 'fa fa-cc-jcb', 'fa fa-cc-diners-club',
  'fa fa-cc-apple-pay', 'fa fa-cc-amazon-pay', 'fa fa-cc-paypal', 'fa fa-cc-stripe', 'fa fa-cc-jcb',
  'fa fa-cc-diners-club', 'fa fa-cc-apple-pay', 'fa fa-cc-amazon-pay', 'fa fa-credit-card', 'fa fa-credit-card-alt',
  'fa fa-money', 'fa fa-dollar', 'fa fa-euro', 'fa fa-pound', 'fa fa-rupee', 'fa fa-yen', 'fa fa-won',
  'fa fa-ruble', 'fa fa-shekel', 'fa fa-turkish-lira', 'fa fa-bitcoin', 'fa fa-btc', 'fa fa-ethereum',
  'fa fa-litecoin', 'fa fa-dogecoin', 'fa fa-monero', 'fa fa-ripple', 'fa fa-stellar', 'fa fa-tether',
  'fa fa-binance', 'fa fa-coinbase', 'fa fa-kraken', 'fa fa-gemini', 'fa fa-bitfinex', 'fa fa-okex',
  'fa fa-ftx', 'fa fa-coinbase-pro', 'fa fa-coinbase-advanced', 'fa fa-coinbase-prime', 'fa fa-coinbase-custody',
  'fa fa-coinbase-commerce', 'fa fa-coinbase-wallet', 'fa fa-coinbase-card', 'fa fa-coinbase-ventures',
  'fa fa-coinbase-ventures', 'fa fa-coinbase-ventures', 'fa fa-coinbase-ventures', 'fa fa-coinbase-ventures'
];

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = fontAwesomeIcons.filter(icon => 
    !search || icon.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Search className="w-4 h-4 mr-2" />
          {value || 'Escolher ícone'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3">
          <Input
            placeholder="Buscar ícone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
          />
          <div className="max-h-60 overflow-y-auto">
            <div className="grid grid-cols-6 gap-1">
              {filteredIcons.map((icon) => (
                <Button
                  key={icon}
                  variant="ghost"
                  size="sm"
                  className="h-16 w-full p-2 text-xs hover:bg-accent flex flex-col items-center justify-center"
                  onClick={() => {
                    onChange(icon);
                    setOpen(false);
                  }}
                >
                  <i className={`${icon} text-2xl mb-1`}></i>
                  <span className="text-xs truncate w-full text-center">{icon.replace('fa fa-', '')}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
