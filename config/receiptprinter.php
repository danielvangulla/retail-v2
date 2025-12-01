<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Printer connector type
    |--------------------------------------------------------------------------
    |
    | Connection protocol to communicate with the receipt printer.
    | Valid values are: cups, network, windows
    |
    */
    'connector_type' => 'network',
    /*
    |--------------------------------------------------------------------------
    | Printer connector descriptor
    |--------------------------------------------------------------------------
    |
    | Typically printer name or IP address.
    |
    */
    'connector_descriptor' => '192.168.20.169',
    /*
    |--------------------------------------------------------------------------
    | Printer port
    |--------------------------------------------------------------------------
    |
    | Typically 9100.
    |
    */
    'connector_port' => 9100,
];
