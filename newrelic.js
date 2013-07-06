exports.config = {
  /**
   * Array of application names.
   */
  app_name : ['newedenfaces'],
  /**
   * Your New Relic license key.
   */
  license_key : '83dd85a0736b483d847bc1ca8e7c912e0b69c65b',
  logging : {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level : 'trace'
  }
};
